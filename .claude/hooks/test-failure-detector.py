#!/usr/bin/env python3
"""
Test Failure Detector - PostToolUse hook that sets needs_learn after test failures.

Triggers on: Bash commands that look like test runs with non-zero exit code.
Sets: needs_learn: true, needs_learn_reason: "test_failure"

This enforces the learn-after-fix loop in the kernel.
"""

import json
import sys
from pathlib import Path
from datetime import datetime

STATE_DIR = Path('.claude/state')
SESSION_STATE = STATE_DIR / 'session_state.json'
DEBUG_LOG = STATE_DIR / 'hook_debug.log'


def debug_log(message: str):
    """Write debug info to log file."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    with open(DEBUG_LOG, 'a') as f:
        f.write(f"[{datetime.now().isoformat()}] {message}\n")

# Patterns that indicate a test command
TEST_COMMAND_PATTERNS = (
    'pytest',
    'python -m pytest',
    'npm test',
    'npm run test',
    'yarn test',
    'jest',
    'mocha',
    'cargo test',
    'go test',
    'dotnet test',
    'mvn test',
    'gradle test',
)


def read_state(state_file: Path) -> dict:
    if not state_file.exists():
        return {}
    try:
        return json.loads(state_file.read_text())
    except:
        return {}


def write_state(state_file: Path, state: dict):
    """Write state back to file."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    try:
        state_file.write_text(json.dumps(state, indent=2))
    except:
        pass  # Best effort


def is_test_command(command: str) -> bool:
    """Check if command looks like a test run."""
    cmd = command.strip().lower()
    for pattern in TEST_COMMAND_PATTERNS:
        if pattern.lower() in cmd:
            return True
    return False


def main():
    debug_log("=== Hook triggered ===")

    try:
        data = json.load(sys.stdin)
        debug_log(f"Received data keys: {list(data.keys())}")
    except Exception as e:
        debug_log(f"Failed to parse stdin: {e}")
        sys.exit(0)

    tool_name = data.get('tool_name', '')
    debug_log(f"tool_name: {tool_name}")

    # Only check Bash commands
    if tool_name != 'Bash':
        debug_log(f"Skipping - not Bash")
        sys.exit(0)

    tool_input = data.get('tool_input', {})
    # NOTE: Claude Code sends 'tool_response' not 'tool_result'
    tool_result = data.get('tool_response', {})

    debug_log(f"tool_input keys: {list(tool_input.keys()) if isinstance(tool_input, dict) else type(tool_input)}")
    debug_log(f"tool_response keys: {list(tool_result.keys()) if isinstance(tool_result, dict) else type(tool_result)}")
    debug_log(f"tool_response type: {type(tool_result)}")

    command = tool_input.get('command', '')
    debug_log(f"command: {command[:100]}...")

    # Only check test commands
    if not is_test_command(command):
        debug_log(f"Skipping - not a test command")
        sys.exit(0)

    debug_log(f"Detected test command!")
    debug_log(f"tool_response content (first 500 chars): {str(tool_result)[:500]}")

    # Check exit code (non-zero = failure)
    # PostToolUse receives the result, which includes exit code for Bash
    # Fallback: check stdout/stderr for failure patterns if exit_code not available
    exit_code = tool_result.get('exit_code')

    # If exit_code not in tool_result, try to detect failure from output
    if exit_code is None:
        stdout = tool_result.get('stdout', '') or ''
        stderr = tool_result.get('stderr', '') or ''
        output = (stdout + stderr).lower()

        # Common test failure patterns
        failure_patterns = [
            'failed', 'failure', 'error', 'exception',
            'assert', 'traceback', 'exit code 1', 'exit code 2',
            'tests failed', 'test failed', '1 failed', '2 failed',
        ]

        # Check if any failure pattern is in output
        has_failure = any(pattern in output for pattern in failure_patterns)
        exit_code = 1 if has_failure else 0

    debug_log(f"Detected exit_code: {exit_code}")

    if exit_code != 0:
        debug_log(f"Test FAILED - setting needs_learn=true")
        # Test failed - set needs_learn
        session_state = read_state(SESSION_STATE)
        session_state['needs_learn'] = True
        session_state['needs_learn_reason'] = 'test_failure'
        write_state(SESSION_STATE, session_state)

        # Inform the agent (this goes to stderr, visible to agent)
        sys.stderr.write(f"""
TEST FAILURE DETECTED

Exit code: {exit_code}
Command: {command}

You must invoke /kernel/learn after fixing this failure.
Next write will be blocked until lesson is recorded.
""")

    sys.exit(0)


if __name__ == '__main__':
    main()
