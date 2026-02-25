#!/usr/bin/env python3
"""
Universal Gate Enforcer - Smart gate that blocks AND provides fix data.

Tracks: Write, Edit, Bash (unified action counter - AUTO-INCREMENTED)

Gates:
1. session_started = true
2. needs_learn = false (must learn after fix)
3. anchored = true
4. actions_since_anchor <= limit (AUTO-INCREMENTED by hook, not agent)

Auto-increment: Hook increments counter on every tracked action.
Agent does NOT need to increment manually. This ensures reliable tracking.

Learn triggers (set by other mechanisms):
- Test failure (PostToolUse hook on Bash)
- Anchor violation (self-catch via /kernel/anchor Part B)
"""

import json
import sys
from pathlib import Path

STATE_DIR = Path('.claude/state')
SESSION_STATE = STATE_DIR / 'session_state.json'

# Bash commands that are always allowed (read-only / safe)
SAFE_BASH_PREFIXES = (
    'ls', 'cat', 'head', 'tail', 'grep', 'find', 'pwd', 'echo',
    'git status', 'git log', 'git diff', 'git show', 'git branch',
    'node --version', 'npm --version', 'python --version',
    'which', 'where', 'type',
)


def get_domain_state_file(domain: str) -> Path:
    return STATE_DIR / f'{domain}_workflow.json'


def read_state(state_file: Path) -> dict:
    if not state_file.exists():
        return {}
    try:
        return json.loads(state_file.read_text())
    except:
        return {}


def write_state(state_file: Path, state: dict):
    """Write state back to file."""
    try:
        state_file.write_text(json.dumps(state, indent=2))
    except:
        pass  # Best effort - don't block on write failure


def smart_block(missing: str, fix_command: str, fix_description: str):
    message = f"""BLOCKED: {missing}

FIX:
1. Invoke {fix_command}
2. {fix_description}
3. Then retry your command

Command: {fix_command}
"""
    sys.stderr.write(message)
    sys.exit(2)


def is_safe_bash(command: str) -> bool:
    """Check if bash command is read-only/safe."""
    cmd = command.strip().lower()
    for prefix in SAFE_BASH_PREFIXES:
        if cmd.startswith(prefix.lower()):
            return True
    return False


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool_name = data.get('tool_name', '')
    tool_input = data.get('tool_input', {})

    # Only gate Edit, Write, Bash
    if tool_name not in ('Write', 'Edit', 'Bash'):
        sys.exit(0)

    # For Bash: allow safe/read-only commands
    if tool_name == 'Bash':
        command = tool_input.get('command', '')
        if is_safe_bash(command):
            sys.exit(0)

    # For Write/Edit: get file path
    file_path = tool_input.get('file_path', '').replace('\\', '/')

    # Skip most .claude/ paths (commands, hooks, settings, protocols)
    # BUT enforce that workflow state action counters can't be directly edited
    if tool_name in ('Write', 'Edit'):
        if '/.claude/' in file_path or file_path.startswith('.claude/'):
            # Block TARGETED edits to actions_since_anchor in workflow state files
            # Agent MUST use /kernel/anchor to reset the counter, not edit state directly
            # Only blocks Edit tool (targeted field change) — allows Write tool (full state updates from commands)
            if '_workflow.json' in file_path and tool_name == 'Edit':
                old_string = tool_input.get('old_string', '')
                new_string = tool_input.get('new_string', '')
                if 'actions_since_anchor' in old_string or 'actions_since_anchor' in new_string:
                    smart_block(
                        missing="Direct edit to action counter detected",
                        fix_command="/kernel/anchor",
                        fix_description="Use /kernel/anchor to reset the counter — never edit actions_since_anchor directly"
                    )
            sys.exit(0)

    # Read session state
    session_state = read_state(SESSION_STATE)

    # Gate 1: Session started?
    if not session_state.get('session_started'):
        smart_block(
            missing="Session not started",
            fix_command="/kernel/session-start",
            fix_description="This initializes the session"
        )

    # Gate 2: Needs learn? (must invoke learn before continuing)
    if session_state.get('needs_learn'):
        reason = session_state.get('needs_learn_reason', 'unknown')
        smart_block(
            missing=f"Lesson not recorded (trigger: {reason})",
            fix_command="/kernel/learn",
            fix_description="Record what you learned from the fix"
        )

    # Gate 3: Anchored?
    domain = session_state.get('domain')
    if domain:
        domain_state = read_state(get_domain_state_file(domain))
        if not domain_state.get('anchored'):
            smart_block(
                missing="Protocol not anchored",
                fix_command="/kernel/anchor",
                fix_description="This reads protocol and updates state"
            )

        # Gate 4: Action limit (Write, Edit, Bash all count)
        # AUTO-INCREMENT: Hook increments counter, not agent
        actions_limit = domain_state.get('actions_limit', 10)
        actions_since = domain_state.get('actions_since_anchor', 0)

        # Increment BEFORE checking (this action counts)
        actions_since += 1
        domain_state['actions_since_anchor'] = actions_since
        domain_state_file = get_domain_state_file(domain)
        write_state(domain_state_file, domain_state)

        if actions_since > actions_limit:
            smart_block(
                missing=f"{actions_limit} actions since last anchor ({actions_since} actions)",
                fix_command="/kernel/anchor",
                fix_description="This re-centers on protocol and resets counter"
            )

    sys.exit(0)


if __name__ == '__main__':
    main()
