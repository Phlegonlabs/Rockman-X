#!/bin/bash
# hooks/post-response.sh

set -euo pipefail

# Get plugin root (set by Claude Code or fallback to script dir)
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

# Get environment variables from Claude Code
CONTEXT_USAGE=${CLAUDE_CONTEXT_USAGE:-0}
WORKING_DIR=${CLAUDE_WORKING_DIR:-$(pwd)}
TIMESTAMP=${CLAUDE_TIMESTAMP:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}

# Extract number from percentage (e.g., "67%" -> 67)
USAGE_NUM=$(echo "$CONTEXT_USAGE" | tr -d '%')

# Default threshold
THRESHOLD=${CLAUDE_CONTEXT_THRESHOLD:-65}

# Check if context usage exceeds threshold
if [ "$USAGE_NUM" -ge "$THRESHOLD" ]; then
  # Trigger state save
  node "${PLUGIN_ROOT}/lib/save-state.js" \
    --working-dir "$WORKING_DIR" \
    --context-usage "$CONTEXT_USAGE" \
    --timestamp "$TIMESTAMP"
fi

exit 0
