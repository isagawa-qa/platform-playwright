#!/bin/bash
#
# common.sh — Shared helper functions for run-task scripts
#
# Source this file: source "$(dirname "$0")/lib/common.sh"

# --- Detect platform ---
IS_WINDOWS=false
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
  IS_WINDOWS=true
fi

# --- Validate dependencies ---
validate_deps() {
  # Find a working Python — test with actual execution, not just PATH lookup
  # (Windows has a fake python3 alias that points to Microsoft Store)
  PYTHON_CMD=""
  if python --version &>/dev/null 2>&1; then
    PYTHON_CMD="python"
  elif python3 --version &>/dev/null 2>&1; then
    PYTHON_CMD="python3"
  fi
  if [ -z "$PYTHON_CMD" ]; then
    echo "ERROR: Python 3 is required but not found (neither python nor python3 works)"
    exit 1
  fi
  if ! command -v claude &>/dev/null; then
    echo "ERROR: Claude CLI is required but not found in PATH"
    exit 1
  fi
}

# --- Validate repo ---
validate_repo() {
  local repo="$1"
  if [ ! -d "$repo" ]; then
    echo "ERROR: Directory not found: $repo"
    exit 1
  fi
  if [ ! -f "$repo/CLAUDE.md" ]; then
    echo "ERROR: Not a kernel repo (no CLAUDE.md): $repo"
    exit 1
  fi
}

# --- Resolve paths for Windows compatibility ---
resolve_paths() {
  local repo="$1"
  if command -v cygpath &>/dev/null; then
    STATE_FILE=$(cygpath -m "$repo/.claude/state/session_state.json")
    LOG_DIR=$(cygpath -m "$repo/.claude/state")
  else
    STATE_FILE="$repo/.claude/state/session_state.json"
    LOG_DIR="$repo/.claude/state"
  fi
  mkdir -p "$LOG_DIR"
}

# --- Kill a process and its children ---
kill_process_tree() {
  local pid="$1"
  if [ -z "$pid" ]; then return; fi

  if [ "$IS_WINDOWS" = true ]; then
    # Git Bash $! returns MSYS2 PIDs, but taskkill needs Windows PIDs.
    # First try kill (works with MSYS2 PIDs), then try taskkill with
    # the Windows PID resolved via /proc/$pid/winpid if available.
    local winpid=""
    if [ -f "/proc/$pid/winpid" ]; then
      winpid=$(cat "/proc/$pid/winpid" 2>/dev/null)
    fi

    # Kill via MSYS2 first (reliable for the direct process)
    kill -9 "$pid" 2>/dev/null || true

    # Kill Windows process tree if we resolved the winpid
    if [ -n "$winpid" ]; then
      taskkill //F //T //PID "$winpid" &>/dev/null || true
    fi
  else
    # Unix: kill process group
    kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
  fi
}

# --- Pre-initialize session state ---
# Avoids deadlock where agent can't write session_started=true
# because Claude Code's sensitive file guard blocks .claude/state/ writes
# $1: key=value pairs  $2: optional explicit state file path (for per-agent routing)
pre_init_state() {
  local key_values="$1"  # e.g. "session_started=True,one_shot=True"
  local state_file="${2:-$STATE_FILE}"
  $PYTHON_CMD -c "
import json, pathlib
f = pathlib.Path('$state_file')
s = json.loads(f.read_text(encoding='utf-8-sig')) if f.exists() else {}
for kv in '$key_values'.split(','):
    k, v = kv.strip().split('=')
    s[k] = True if v == 'True' else (False if v == 'False' else v)
f.parent.mkdir(parents=True, exist_ok=True)
f.write_text(json.dumps(s, indent=2))
" || {
    echo "ERROR: Failed to pre-initialize state in $state_file"
    exit 1
  }
}

# --- Resolve workflow file (per-agent if agent_id set) ---
resolve_workflow_file() {
  $PYTHON_CMD -c "
import json, pathlib
sf = pathlib.Path('$STATE_FILE')
if not sf.exists():
    print(''); exit()
s = json.loads(sf.read_text())
d = s.get('domain', '')
if not d:
    print(''); exit()
agent_id = s.get('agent_id')
if agent_id:
    af = sf.parent / f'agent-{agent_id}-workflow.json'
    if af.exists():
        print(str(af)); exit()
wf = sf.parent / (d + '_workflow.json')
print(str(wf))
" 2>/dev/null
}

# --- Print current state ---
print_state() {
  $PYTHON_CMD -c "
import json, pathlib
sf = pathlib.Path('$STATE_FILE')
if not sf.exists():
    print('  (no state file)')
else:
    s = json.loads(sf.read_text(encoding='utf-8-sig'))
    print('  session_started:', s.get('session_started'))
    print('  one_shot:', s.get('one_shot'))
    d = s.get('domain', '')
    agent_id = s.get('agent_id')
    if d:
        if agent_id:
            wf = sf.parent / f'agent-{agent_id}-workflow.json'
            if not wf.exists():
                wf = sf.parent / (d + '_workflow.json')
        else:
            wf = sf.parent / (d + '_workflow.json')
        if wf.exists():
            w = json.loads(wf.read_text(encoding='utf-8-sig'))
            print('  anchored:', w.get('anchored'))
            print('  completed:', len(w.get('completed_tasks', [])))
            print('  skipped:', len(w.get('skipped_tasks', [])))
            print('  current:', w.get('current_task'))
            if agent_id:
                print('  agent_id:', agent_id)
                print('  workflow_file:', wf.name)
" || echo "  (state read failed)"
}

# --- Extract session_id from JSON output ---
extract_session_id() {
  local logfile="$1"
  if [ ! -f "$logfile" ] || [ ! -s "$logfile" ]; then
    echo ""
    return
  fi
  $PYTHON_CMD -c "
import sys, json
try:
    data = json.loads(open('$logfile').read())
    print(data.get('session_id', ''))
except Exception:
    print('')
"
}

# --- Extract result text from JSON output ---
extract_result() {
  local logfile="$1"
  if [ ! -f "$logfile" ] || [ ! -s "$logfile" ]; then
    echo ""
    return
  fi
  $PYTHON_CMD -c "
import sys, json
try:
    data = json.loads(open('$logfile').read())
    print(data.get('result', ''))
except Exception:
    print('')
"
}

# --- Check for completion signals in text ---
check_completion() {
  local text="$1"
  if printf '%s' "$text" | grep -q "ALL_TASKS_COMPLETE"; then
    echo "all_done"
  elif printf '%s' "$text" | grep -q "ONE_SHOT_COMPLETE"; then
    echo "task_done"
  elif printf '%s' "$text" | grep -qi "no incomplete tasks"; then
    echo "all_done"
  else
    echo "no_signal"
  fi
}

# --- Skip current task in workflow state ---
# $1: agent_id (or "default"/empty) — routes to agent-{id}-workflow.json when set,
# matching verify_completion_write/check_stall. Must NOT be derived from the
# parent session_state.json's 'agent_id' field, which is unset for routed runs
# (that fallback silently wrote the PARENT workflow file — WI-02).
skip_current_task() {
  local agent_id="$1"
  $PYTHON_CMD -c "
import json, pathlib
sf = pathlib.Path('$STATE_FILE')
if not sf.exists():
    exit(0)
s = json.loads(sf.read_text(encoding='utf-8-sig'))
domain = s.get('domain', '')
if not domain:
    exit(0)
agent_id = '$agent_id'
if agent_id and agent_id != 'default':
    wf = sf.parent / f'agent-{agent_id}-workflow.json'
    if not wf.exists():
        wf = sf.parent / (domain + '_workflow.json')
else:
    wf = sf.parent / (domain + '_workflow.json')
if not wf.exists():
    exit(0)
w = json.loads(wf.read_text(encoding='utf-8-sig'))
task = w.get('current_task')
if task and task not in w.get('skipped_tasks', []):
    if 'skipped_tasks' not in w:
        w['skipped_tasks'] = []
    w['skipped_tasks'].append(task)
    w['current_task'] = None
    w['attempts_on_current'] = 0
    wf.write_text(json.dumps(w, indent=2))
    print('SKIPPED: ' + task)
else:
    print('(no task to skip)')
"
}

# --- Write-verify: confirm a task_done signal actually persisted to completed_tasks
# in the routed workflow file; on mismatch, append it directly and retry (bounded). RH-01.
verify_completion_write() {
  local task="$1"
  local agent_id="$2"
  local max_retries=3
  local attempt=0
  local confirmed="false"

  while [ "$attempt" -lt "$max_retries" ]; do
    confirmed=$($PYTHON_CMD -c "
import json, pathlib
sf = pathlib.Path('$STATE_FILE')
if not sf.exists():
    print('false'); exit()
s = json.loads(sf.read_text(encoding='utf-8-sig'))
d = s.get('domain', '')
agent_id = '$agent_id'
if agent_id and agent_id != 'default':
    wf = sf.parent / f'agent-{agent_id}-workflow.json'
    if not wf.exists():
        wf = sf.parent / (d + '_workflow.json') if d else None
else:
    wf = sf.parent / (d + '_workflow.json') if d else None
if not wf or not wf.exists():
    print('false'); exit()
w = json.loads(wf.read_text(encoding='utf-8-sig'))
done = set(w.get('completed_tasks', []) + w.get('skipped_tasks', []))
print('true' if '$task' in done else 'false')
" 2>/dev/null || echo "false")

    if [ "$confirmed" = "true" ]; then
      return 0
    fi

    attempt=$((attempt + 1))
    echo "[WRITE-VERIFY] Completion for '$task' not found in routed workflow state (attempt $attempt/$max_retries). Retrying state write..."

    $PYTHON_CMD -c "
import json, pathlib
sf = pathlib.Path('$STATE_FILE')
if not sf.exists():
    exit(0)
s = json.loads(sf.read_text(encoding='utf-8-sig'))
d = s.get('domain', '')
agent_id = '$agent_id'
if agent_id and agent_id != 'default':
    wf = sf.parent / f'agent-{agent_id}-workflow.json'
    if not wf.exists():
        wf = sf.parent / (d + '_workflow.json') if d else None
else:
    wf = sf.parent / (d + '_workflow.json') if d else None
if not wf:
    exit(0)
w = json.loads(wf.read_text(encoding='utf-8-sig')) if wf.exists() else {}
if 'completed_tasks' not in w:
    w['completed_tasks'] = []
if '$task' not in w['completed_tasks']:
    w['completed_tasks'].append('$task')
w['current_task'] = None
wf.parent.mkdir(parents=True, exist_ok=True)
wf.write_text(json.dumps(w, indent=2))
" 2>/dev/null

    sleep 1
  done

  if [ "$confirmed" != "true" ]; then
    echo "[WRITE-VERIFY] WARNING: completion for '$task' could not be confirmed after $max_retries attempts."
    return 1
  fi
  return 0
}

# --- Check heartbeat staleness; mark routed workflow state 'stalled' + return
# non-zero if the heartbeat is older than threshold_seconds AND tasks remain.
# A missing heartbeat, a fresh heartbeat, or no remaining work are all healthy
# (return 0) — only stale-with-work-remaining is a stall. RH-02.
# $1: heartbeat file path  $2: threshold in seconds  $3: agent_id (or "default")
check_stall() {
  local heartbeat_file="$1"
  local threshold_seconds="$2"
  local agent_id="$3"

  if [ ! -f "$heartbeat_file" ]; then
    return 0
  fi

  local age
  age=$($PYTHON_CMD -c "
import pathlib, time
p = pathlib.Path(r'$heartbeat_file')
print(int(time.time() - p.stat().st_mtime))
" 2>/dev/null || echo "0")

  if [ -z "$age" ] || [ "$age" -le "$threshold_seconds" ]; then
    return 0
  fi

  local remaining
  remaining=$($PYTHON_CMD -c "
import json, pathlib
sf = pathlib.Path('$STATE_FILE')
if not sf.exists():
    print('unknown'); exit()
s = json.loads(sf.read_text(encoding='utf-8-sig'))
d = s.get('domain', '')
agent_id = '$agent_id'
if agent_id and agent_id != 'default':
    wf = sf.parent / f'agent-{agent_id}-workflow.json'
    if not wf.exists():
        wf = sf.parent / (d + '_workflow.json') if d else None
else:
    wf = sf.parent / (d + '_workflow.json') if d else None
if not wf or not wf.exists():
    print('unknown'); exit()
w = json.loads(wf.read_text(encoding='utf-8-sig'))
total = w.get('total_tasks', 0) or 0
done = len(set(w.get('completed_tasks', []) + w.get('skipped_tasks', [])))
print('all_done' if (total > 0 and done >= total) else 'remaining')
" 2>/dev/null || echo "unknown")

  if [ "$remaining" != "remaining" ]; then
    return 0
  fi

  $PYTHON_CMD -c "
import json, pathlib, datetime
sf = pathlib.Path('$STATE_FILE')
s = json.loads(sf.read_text(encoding='utf-8-sig')) if sf.exists() else {}
d = s.get('domain', '')
agent_id = '$agent_id'
if agent_id and agent_id != 'default':
    wf = sf.parent / f'agent-{agent_id}-workflow.json'
    if not wf.exists():
        wf = sf.parent / (d + '_workflow.json') if d else None
else:
    wf = sf.parent / (d + '_workflow.json') if d else None
if wf:
    w = json.loads(wf.read_text(encoding='utf-8-sig')) if wf.exists() else {}
    w['stalled'] = True
    w['stall_reason'] = 'heartbeat stale for ${age}s (threshold ${threshold_seconds}s) with work remaining'
    w['stall_timestamp'] = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    wf.parent.mkdir(parents=True, exist_ok=True)
    wf.write_text(json.dumps(w, indent=2))
" 2>/dev/null

  echo "[STALL] Heartbeat stale for ${age}s (threshold ${threshold_seconds}s) with work remaining. Marked stalled in routed state."
  return 1
}

# --- Write output safely (handles -n, -e in content) ---
write_log() {
  local content="$1"
  local logfile="$2"
  printf '%s\n' "$content" > "$logfile"
}
