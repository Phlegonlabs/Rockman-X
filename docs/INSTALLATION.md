# Installation Guide

## Prerequisites

- Node.js 16+ installed
- Claude Code CLI installed and configured
- Git (for file snapshot features)

## Installation Methods

### Method 1: Plugin Install (Recommended)

```bash
# From GitHub
/plugin install github:user/context-spawner

# From local directory
/plugin install ./context-spawner
```

### Method 2: Manual Install

```bash
cd context-spawner
npm install
```

Then add to `~/.claude/config.json`:

```json
{
  "hooks": {
    "post-response": "/path/to/context-spawner/hooks/post-response.sh",
    "pre-session": "/path/to/context-spawner/hooks/pre-session.sh"
  }
}
```

## Configuration

### Optional Configuration

Add to `~/.claude/config.json`:

```json
{
  "contextSpawner": {
    "threshold": 65,
    "maxStates": 3,
    "autoCleanup": true,
    "notificationStyle": "compact",
    "restoreOnNewSession": true
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `threshold` | 65 | Context usage % to trigger save |
| `maxStates` | 3 | Number of state files to keep |
| `autoCleanup` | true | Auto-delete old states |
| `notificationStyle` | compact | Notification display style |
| `restoreOnNewSession` | true | Auto-restore on new session |

## Verification

Test your installation:

```bash
# Check hooks are registered
claude-code hooks list

# Trigger a manual save (in a git repo)
cd /path/to/your/repo
CLAUDE_CONTEXT_USAGE="67%" CLAUDE_WORKING_DIR="$(pwd)" ./hooks/post-response.sh
```

You should see a `.claude-context` folder created with a state file.

## Troubleshooting

### Hook Not Triggering

1. Verify plugin is installed: `/plugin list`
2. Check hooks are registered
3. Restart Claude Code CLI

### State Not Saving

1. Check write permissions in repository
2. Verify Node.js is in PATH
3. Check stderr output for errors

### State Not Restoring

1. Ensure `.claude-context/` folder exists
2. Check `restoreOnNewSession` is true
3. Verify state files are valid JSON

## Uninstallation

```bash
/plugin uninstall context-spawner
```

Or remove hooks from `~/.claude/config.json`.

Optionally remove state folders:

```bash
find . -type d -name ".claude-context" -exec rm -rf {} +
```
