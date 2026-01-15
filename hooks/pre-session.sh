#!/bin/bash
# hooks/pre-session.sh

set -euo pipefail

# Get working directory
WORKING_DIR=${CLAUDE_WORKING_DIR:-$(pwd)}
STATE_DIR="$WORKING_DIR/.claude-context"

# Check if state directory exists
if [ -d "$STATE_DIR" ]; then
  # Trigger state restoration
  node "$(dirname "$0")/../lib/restore-state.js" \
    --working-dir "$WORKING_DIR"
fi

exit 0
