#!/bin/bash
# hooks/pre-session.sh

set -euo pipefail

# Get plugin root (set by Claude Code or fallback to script dir)
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

# Get working directory
WORKING_DIR=${CLAUDE_WORKING_DIR:-$(pwd)}
STATE_DIR="$WORKING_DIR/.claude-context"

# Check if state directory exists
if [ -d "$STATE_DIR" ]; then
  # Trigger state restoration
  node "${PLUGIN_ROOT}/lib/restore-state.js" \
    --working-dir "$WORKING_DIR"
fi

exit 0
