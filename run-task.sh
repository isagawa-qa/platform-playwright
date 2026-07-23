#!/bin/bash
set -uo pipefail
#
# run-task.sh — One-shot task execution with session resume for Isagawa Kernel
#
# Each iteration: pre-init state → claude -p (JSON) → detect completion
# On failure: retry with --resume to preserve full conversation context
# State files on disk provide continuity between successful iterations.
#
# Usage:
#   ./run-task.sh [repo_path] [max_iterations] [task_folder] [backlog_path]
#
# Arguments:
#   repo_path       Path to kernel-enabled repo (default: current directory)
#   max_iterations  Max tasks to attempt (default: 10, use task_count + 2 for buffer)
#   task_folder     Subfolder under tasks/ (default: none, uses tasks/)
#                   Example: "kernel-test" → tasks/kernel-test/
#   backlog_path    Path to backlog .md file (optional). If provided, on ALL_TASKS_COMPLETE
#                   the backlog is moved to docs/backlog/done/ and task folder to tasks/completed/

# --- Configuration ---
REPO="${1:-.}"
MAX_ITERATIONS="${2:-10}"
TASK_SUBFOLDER="${3:-}"
BACKLOG_PATH="${4:-}"
COMPLETED=0
FAILED=0
CONSECUTIVE_FAILS=0
MAX_CONSECUTIVE_FAILS=4
MAX_RESUME_RETRIES=2
TASK_TIMEOUT=600  # 10 min per claude -p invocation (extraction tasks need more time)
SLEEP_BETWEEN=2
EMPTY_OUTPUT_BACKOFF=$SLEEP_BETWEEN  # Exponential backoff for empty outputs (cap 30s)
CURRENT_TASK=""   # Global: current task name, set before each run_claude call
DEFAULT_MODEL="${DEFAULT_MODEL:-claude-opus-4-8}"  # Base runner model; optional 272 router layer overrides per-task
HEARTBEAT_STALL_THRESHOLD="${HEARTBEAT_STALL_THRESHOLD:-900}"  # 262/270 RH-02: stale-heartbeat-with-work = stall

# --- Resolve script directory and source shared lib ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/lib/common.sh"
# Optional model-router layer (272): source only if installed. The minimal base runs
# on DEFAULT_MODEL; installing lib/model-router.sh adds per-task tiering (route_model/upgrade_model).
if [ -f "${SCRIPT_DIR}/lib/model-router.sh" ]; then
  source "${SCRIPT_DIR}/lib/model-router.sh"
fi

# --- Validate ---
validate_deps
REPO=$(cd "$REPO" && pwd)
validate_repo "$REPO"
resolve_paths "$REPO"

# --- Lock file (prevent concurrent invocations on same task folder) ---
LOCK_FILE="${REPO}/.claude/state/${TASK_SUBFOLDER:-default}_run-task.lock"
if [ -f "$LOCK_FILE" ]; then
  LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null)
  if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
    echo "ERROR: Another run-task.sh is already running for this task folder (PID $LOCK_PID)"
    echo "Lock file: $LOCK_FILE"
    echo "To force: delete $LOCK_FILE and retry"
    exit 1
  else
    echo "[WARN] Stale lock file found (PID $LOCK_PID not running). Removing."
    rm -f "$LOCK_FILE"
  fi
fi
echo $$ > "$LOCK_FILE"
# Clean up lock on exit
cleanup_lock() { rm -f "$LOCK_FILE"; }
trap 'cleanup_lock; cleanup' SIGINT SIGTERM
trap 'cleanup_lock' EXIT

# --- Resolve task folder ---
if [ -n "$TASK_SUBFOLDER" ]; then
  TASK_DIR="tasks/${TASK_SUBFOLDER}/"
else
  TASK_DIR="tasks/"
fi

# --- Prompts ---
PROMPT="You have full permissions. Do not ask for permission — just act.

Read CLAUDE.md and follow the kernel workflow:
1. Read and follow .claude/commands/kernel/session-start.md
2. Read and follow .claude/commands/kernel/anchor.md
3. Pick the next incomplete task from ${TASK_DIR} (check completed_tasks in workflow state)
4. Implement the task and verify its acceptance criteria
5. Read and follow .claude/commands/kernel/complete.md

After completing the task, output the exact text ONE_SHOT_COMPLETE on its own line.
If there are no incomplete tasks remaining, output ALL_TASKS_COMPLETE on its own line."

RESUME_PROMPT="The previous run did not complete. You still have full context from that attempt.

Continue where you left off:
1. Check what was already done — don't repeat work
2. If the task is partially complete, finish it
3. If it failed, diagnose and fix
4. Read and follow .claude/commands/kernel/complete.md when done

After completing the task, output the exact text ONE_SHOT_COMPLETE on its own line.
If there are no incomplete tasks remaining, output ALL_TASKS_COMPLETE on its own line."

# --- Log prefix (namespace by task subfolder to avoid cross-pipeline overwrites) ---
if [ -n "$TASK_SUBFOLDER" ]; then
  LOG_PREFIX="${TASK_SUBFOLDER}_"
else
  LOG_PREFIX=""
fi

# --- Trap for clean exit on signals ---
cleanup() {
  echo ""
  echo "============================================"
  echo "  INTERRUPTED"
  echo "  Completed: $COMPLETED"
  echo "  Failed: $FAILED"
  echo "  Check logs: ${LOG_DIR}/${LOG_PREFIX:-}iteration_*.log"
  echo "============================================"
  # Kill any lingering claude processes spawned by this script
  if [ -n "${CLAUDE_PID:-}" ] && kill -0 "$CLAUDE_PID" 2>/dev/null; then
    kill_process_tree "$CLAUDE_PID"
  fi
  exit 130
}
trap cleanup SIGINT SIGTERM

# --- Helper: run claude and return result ---
# Sets: LAST_SESSION_ID, LAST_RESULT, LAST_STATUS
#
# Uses FILE-BASED output capture instead of $() command substitution.
# On Windows (Git Bash), $() drops output from background Agent subprocesses.
# Writing directly to a file is reliable on all platforms.
run_claude() {
  local mode="$1"       # "fresh" or "resume"
  local session_id="$2" # only used for resume
  local logfile="$3"
  local model="${4:-$DEFAULT_MODEL}"  # base default; optional router layer overrides per-task

  local cmd_args=("-p" "--dangerously-skip-permissions" "--output-format" "json" "--model" "$model")

  if [ "$mode" = "resume" ] && [ -n "$session_id" ]; then
    cmd_args+=("--resume" "$session_id")
    local prompt="$RESUME_PROMPT"
    echo "[RUNNING] claude -p --resume $session_id ..."
  else
    local prompt="$PROMPT"
    echo "[RUNNING] claude -p (fresh) ..."
  fi

  # Strip CLAUDECODE env vars so nested claude -p doesn't try MCP handshake
  local claude_env_args=()
  while IFS='=' read -r var _; do
    claude_env_args+=("-u" "$var")
  done < <(env | grep -i '^CLAUDECODE' || true)

  # Build the full command array
  local full_cmd=()
  if [ ${#claude_env_args[@]} -gt 0 ]; then
    full_cmd=(env "${claude_env_args[@]}" claude "${cmd_args[@]}" "$prompt")
  else
    full_cmd=(claude "${cmd_args[@]}" "$prompt")
  fi

  # File-based output capture: write directly to logfile, no $() substitution
  # This avoids the Windows Git Bash bug where $() returns empty for background processes
  > "$logfile"  # truncate

  if [ "$IS_WINDOWS" = true ]; then
    # Windows: run in background, poll for completion, kill tree on timeout
    "${full_cmd[@]}" > "$logfile" 2>&1 &
    local claude_pid=$!
    CLAUDE_PID=$claude_pid  # expose for cleanup trap
    local elapsed=0

    while kill -0 "$claude_pid" 2>/dev/null; do
      sleep 2
      elapsed=$((elapsed + 2))
      if [ "$elapsed" -ge "$TASK_TIMEOUT" ]; then
        echo "[TIMEOUT] Task '$CURRENT_TASK' — claude -p exceeded ${TASK_TIMEOUT}s (PID $claude_pid)"
        kill_process_tree "$claude_pid"
        break
      fi
    done
    wait "$claude_pid" 2>/dev/null || true
    CLAUDE_PID=""  # clear after completion
  else
    # Unix: timeout works correctly, use it directly
    timeout "$TASK_TIMEOUT" "${full_cmd[@]}" > "$logfile" 2>&1 || true
  fi

  # Verify logfile has content
  if [ ! -s "$logfile" ]; then
    echo "[WARNING] claude -p produced no output (logfile empty: $logfile)"
    LAST_SESSION_ID=""
    LAST_RESULT=""
    LAST_STATUS="no_signal"
    return
  fi

  # Extract fields from logfile (file-based, not piped)
  LAST_SESSION_ID=$(extract_session_id "$logfile")
  LAST_RESULT=$(extract_result "$logfile")
  LAST_STATUS=$(check_completion "$LAST_RESULT")

  # Print result summary to screen
  if [ -n "$LAST_RESULT" ]; then
    printf '%s\n' "$LAST_RESULT" | head -20
    local line_count
    line_count=$(printf '%s\n' "$LAST_RESULT" | wc -l)
    if [ "$line_count" -gt 20 ]; then
      echo "... ($line_count lines total, see $logfile)"
    fi
  fi
}

# --- Helper: move completed backlog + task folder to done/completed ---
move_to_done() {
  if [ -n "$BACKLOG_PATH" ] && [ -f "$BACKLOG_PATH" ]; then
    echo "[MOVE] Moving backlog to done: $BACKLOG_PATH"
    mkdir -p docs/backlog/done
    mv "$BACKLOG_PATH" docs/backlog/done/
    # If backlog has a companion folder, move that too
    local backlog_dir="${BACKLOG_PATH%.md}"
    if [ -d "$backlog_dir" ]; then
      mv "$backlog_dir" docs/backlog/done/
    fi
  fi
  if [ -n "$TASK_SUBFOLDER" ]; then
    echo "[MOVE] Moving task folder to completed: tasks/$TASK_SUBFOLDER"
    mkdir -p tasks/completed
    mv "tasks/$TASK_SUBFOLDER" "tasks/completed/$TASK_SUBFOLDER"
  fi
}

# --- Banner ---
echo "============================================"
echo "  Isagawa Kernel - One-Shot Task Runner"
echo "  (with session resume)"
echo "============================================"
echo "Repo: $REPO"
echo "Task folder: $TASK_DIR"
echo "Max iterations: $MAX_ITERATIONS"
echo ""

# --- Set agent ID before loop (used for workflow state isolation) ---
AGENT_ID="${AGENT_ID:-${TASK_SUBFOLDER:-default}}"

# --- Heartbeat file (262): stamped each iteration; external monitors + check_stall read its mtime ---
HEARTBEAT_FILE="${LOG_DIR}/agent-${AGENT_ID}-heartbeat"

# --- Main loop ---
# cd once before loop, not inside run_claude
cd "$REPO"

for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo ""
  echo "=== Iteration $i/$MAX_ITERATIONS ==="

  # Heartbeat (262): stamp liveness so external monitors / check_stall can detect a hung runner
  date -u +%Y-%m-%dT%H:%M:%SZ > "$HEARTBEAT_FILE" 2>/dev/null || true

  # PRE-ITERATION EXIT GUARD: check workflow state before spawning another claude -p
  # This prevents the bug where ALL_TASKS_COMPLETE was returned but we still spawn the next iteration
  # Uses AGENT_ID from shell (not session_state.json) to avoid cross-agent contamination
  if [ "$i" -gt 1 ]; then
    PRECHECK=$($PYTHON_CMD -c "
import json, pathlib
sf = pathlib.Path('$STATE_FILE')
if not sf.exists(): print('continue'); exit()
s = json.loads(sf.read_text())
d = s.get('domain', '')
if not d: print('continue'); exit()
agent_id = '$AGENT_ID'
if agent_id and agent_id != 'default':
    wf = sf.parent / f'agent-{agent_id}-workflow.json'
    if not wf.exists():
        wf = sf.parent / (d + '_workflow.json')
else:
    wf = sf.parent / (d + '_workflow.json')
if not wf.exists(): print('continue'); exit()
w = json.loads(wf.read_text())
total = w.get('total_tasks', 0)
done = len(set(w.get('completed_tasks', [])))
skipped = len(set(w.get('skipped_tasks', [])))
if total > 0 and (done + skipped) >= total:
    print('all_done')
else:
    print('continue')
" 2>/dev/null || echo "continue")

    if [ "$PRECHECK" = "all_done" ]; then
      echo "-> Pre-check: all tasks already complete/skipped in workflow state."
      move_to_done
      echo ""
      echo "============================================"
      echo "  ALL TASKS COMPLETE (detected at iteration start)"
      echo "  Tasks completed this run: $COMPLETED"
      echo "  Total iterations: $((i - 1))"
      echo "============================================"
      exit 0
    fi
  fi

  # Show state before
  echo "[STATE before]"
  print_state
  echo ""

  # Pre-init state (session_started + one_shot + agent_id for state isolation)
  pre_init_state "session_started=True,one_shot=True,agent_id=${AGENT_ID}"

  # Seed per-agent workflow file if it doesn't exist (workflow state isolation)
  if [ -n "$AGENT_ID" ] && [ "$AGENT_ID" != "default" ]; then
    AGENT_WORKFLOW="${LOG_DIR}/agent-${AGENT_ID}-workflow.json"
    if [ ! -f "$AGENT_WORKFLOW" ]; then
      $PYTHON_CMD -c "
import json, pathlib
wf = pathlib.Path('$AGENT_WORKFLOW')
wf.write_text(json.dumps({
    'cycling': False, 'cycling_complete': False,
    'task_folder': 'tasks/${TASK_SUBFOLDER}/' if '${TASK_SUBFOLDER}' else None,
    'total_tasks': None, 'current_task': None,
    'completed_tasks': [], 'skipped_tasks': [],
    'attempts_on_current': 0,
    'complete': False, 'complete_timestamp': None,
    'anchored': True, 'anchor_timestamp': None,
    'actions_since_anchor': 0, 'last_anchor_token_confirmed': None,
    'timestamp': None
}, indent=2))
print('  [SEED] Created ' + wf.name)
" 2>/dev/null
    fi
  fi

  # Identify current task from workflow state (uses shell AGENT_ID, not session_state.json)
  CURRENT_TASK=$($PYTHON_CMD -c "
import json, pathlib
sf = pathlib.Path('$STATE_FILE')
if not sf.exists(): print('unknown'); exit()
s = json.loads(sf.read_text())
d = s.get('domain', '')
if not d: print('unknown'); exit()
agent_id = '$AGENT_ID'
if agent_id and agent_id != 'default':
    wf = sf.parent / f'agent-{agent_id}-workflow.json'
    if not wf.exists():
        wf = sf.parent / (d + '_workflow.json')
else:
    wf = sf.parent / (d + '_workflow.json')
if not wf.exists(): print('unknown'); exit()
w = json.loads(wf.read_text())
print(w.get('current_task', '') or 'unknown')
" 2>/dev/null || echo "unknown")
  echo "[TASK] Attempting: $CURRENT_TASK"

  # Model selection: base uses DEFAULT_MODEL. The optional 272 router layer, if installed,
  # defines route_model (via sourced lib/model-router.sh) and overrides the per-task tier.
  SELECTED_MODEL="$DEFAULT_MODEL"
  if command -v route_model >/dev/null 2>&1; then
    TASK_FILE_PATH=""
    if [ -n "$TASK_SUBFOLDER" ] && [ "$CURRENT_TASK" != "unknown" ]; then
      TASK_FILE_PATH=$(ls "tasks/${TASK_SUBFOLDER}/"*"${CURRENT_TASK}"* 2>/dev/null | head -1)
    fi
    SELECTED_MODEL=$(route_model "${TASK_FILE_PATH:-}" "${SCRIPT_DIR}/lib/model-routing-config.json")
  fi
  echo "[MODEL] Selected: $SELECTED_MODEL (task: $CURRENT_TASK)"

  # Fresh run
  LOGFILE="${LOG_DIR}/${LOG_PREFIX}iteration_${i}.log"
  run_claude "fresh" "" "$LOGFILE" "$SELECTED_MODEL"

  # --- Handle result ---
  if [ "$LAST_STATUS" = "all_done" ]; then
    COMPLETED=$((COMPLETED + 1))
    move_to_done
    echo ""
    echo "============================================"
    echo "  ALL TASKS COMPLETE"
    echo "  Tasks completed this run: $COMPLETED"
    echo "  Total iterations: $i"
    echo "============================================"
    exit 0

  elif [ "$LAST_STATUS" = "task_done" ]; then
    COMPLETED=$((COMPLETED + 1))
    CONSECUTIVE_FAILS=0
    EMPTY_OUTPUT_BACKOFF=$SLEEP_BETWEEN  # Reset backoff on success
    # Write-verify (270 RH-01): confirm the completion actually persisted to the routed workflow file
    verify_completion_write "$CURRENT_TASK" "$AGENT_ID" || echo "[WARN] completion write-verify could not confirm '$CURRENT_TASK'"
    echo ""
    echo "[STATE after]"
    print_state
    echo "-> Task done. ($COMPLETED completed this run)"

  else
    # No completion signal — distinguish empty output (transient) vs content without signal
    if [ -z "$LAST_RESULT" ]; then
      # Empty output — transient failure (rate limit, slow startup, contention)
      echo "-> Empty output (transient). Backing off ${EMPTY_OUTPUT_BACKOFF}s before retry..."
      sleep "$EMPTY_OUTPUT_BACKOFF"
      # Double backoff, cap at 30s
      EMPTY_OUTPUT_BACKOFF=$((EMPTY_OUTPUT_BACKOFF * 2))
      if [ "$EMPTY_OUTPUT_BACKOFF" -gt 30 ]; then EMPTY_OUTPUT_BACKOFF=30; fi
    fi
    echo "-> No completion signal. Attempting resume..."

    RESUME_SESSION_ID="$LAST_SESSION_ID"
    RESUME_SUCCESS=false

    for r in $(seq 1 "$MAX_RESUME_RETRIES"); do
      if [ -z "$RESUME_SESSION_ID" ]; then
        echo "-> No session ID captured, cannot resume."
        break
      fi

      echo ""
      echo "--- Resume attempt $r/$MAX_RESUME_RETRIES (session: $RESUME_SESSION_ID) ---"

      RESUME_LOGFILE="${LOG_DIR}/${LOG_PREFIX}iteration_${i}_resume_${r}.log"
      run_claude "resume" "$RESUME_SESSION_ID" "$RESUME_LOGFILE" "$SELECTED_MODEL"

      if [ "$LAST_STATUS" = "all_done" ]; then
        COMPLETED=$((COMPLETED + 1))
        move_to_done
        echo ""
        echo "============================================"
        echo "  ALL TASKS COMPLETE (after resume)"
        echo "  Tasks completed this run: $COMPLETED"
        echo "  Total iterations: $i"
        echo "============================================"
        exit 0

      elif [ "$LAST_STATUS" = "task_done" ]; then
        COMPLETED=$((COMPLETED + 1))
        CONSECUTIVE_FAILS=0
        RESUME_SUCCESS=true
        # Write-verify (270 RH-01) on the resume-completion path too
        verify_completion_write "$CURRENT_TASK" "$AGENT_ID" || echo "[WARN] completion write-verify could not confirm '$CURRENT_TASK'"
        echo ""
        echo "[STATE after]"
        print_state
        echo "-> Task done after resume. ($COMPLETED completed this run)"
        break

      else
        # Update session ID in case resume created a new one
        RESUME_SESSION_ID="$LAST_SESSION_ID"
        echo "-> Resume attempt $r failed."
      fi
    done

    if [ "$RESUME_SUCCESS" = false ]; then
      # Optional 272 router layer: upgrade model tier before giving up (only if the layer is installed)
      if command -v upgrade_model >/dev/null 2>&1 && [ "$SELECTED_MODEL" != "$DEFAULT_MODEL" ]; then
        UPGRADED_MODEL=$(upgrade_model "$SELECTED_MODEL")
        if [ "$UPGRADED_MODEL" != "$SELECTED_MODEL" ]; then
          echo "[UPGRADE] Retrying with $UPGRADED_MODEL (was $SELECTED_MODEL)"
          SELECTED_MODEL="$UPGRADED_MODEL"
          continue  # Re-enter the loop with upgraded model
        fi
      fi

      FAILED=$((FAILED + 1))
      CONSECUTIVE_FAILS=$((CONSECUTIVE_FAILS + 1))
      echo "-> Task failed after $MAX_RESUME_RETRIES resume attempts. Skipping."
      # 271 wiring: route the skip to the per-agent workflow file (empty arg wrote the PARENT — WI-02 bug)
      skip_current_task "$AGENT_ID"

      if [ $CONSECUTIVE_FAILS -ge $MAX_CONSECUTIVE_FAILS ]; then
        echo ""
        echo "============================================"
        echo "  ABORTING: $MAX_CONSECUTIVE_FAILS consecutive failures"
        echo "  Completed: $COMPLETED"
        echo "  Failed: $FAILED"
        echo "  Check logs: ${LOG_DIR}/${LOG_PREFIX}iteration_*.log"
        echo "============================================"
        exit 1
      fi
    fi
  fi

  sleep "$SLEEP_BETWEEN"
done

echo ""
echo "============================================"
echo "  MAX ITERATIONS REACHED"
echo "  Completed: $COMPLETED"
echo "  Failed: $FAILED"
echo "  Iterations: $MAX_ITERATIONS"
echo "  Check logs: ${LOG_DIR}/${LOG_PREFIX}iteration_*.log"
echo "============================================"
exit 1
