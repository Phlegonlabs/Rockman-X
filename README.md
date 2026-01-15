# Claude Code Context Spawner

[English](README.md) | [繁體中文](README_zh-TW.md)

> Automatically save and restore Claude Code session state when context window reaches threshold.

## Features

- **Automatic State Capture** - Detects when context window reaches threshold (default: 65%)
- **Repository Isolation** - Each repository maintains its own independent state
- **Complete State Preservation** - Tasks, git status, file changes - nothing lost
- **Seamless Restoration** - New sessions automatically restore previous state
- **Auto Cleanup** - Automatically removes old state files to save disk space

## Quick Start

### Installation

```bash
# Step 1: Add the plugin as a marketplace
/plugin marketplace add Phlegonlabs/claude-code-context-spawner

# Step 2: Install the plugin
/plugin install context-spawner@claude-code-context-spawner

# Step 3: Restart Claude Code
```

### That's it!

The plugin works automatically in the background.

## How It Works

```
Session A (context reaches 65%)
    |
    v
[Auto-save state to .claude-context/]
    |
    v
Session B (new session)
    |
    v
[Auto-restore from .claude-context/]
    |
    v
Continue where you left off!
```

## What Gets Saved

| Data | Description |
|------|-------------|
| Tasks | All TODO items and their status |
| Files | Modified files and git status |
| Context | Key decisions and code changes |
| Preferences | Your coding preferences |
| Errors | Problems encountered and solutions tried |

## Configuration

Add to `~/.claude/config.json` (optional):

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

## State File Location

States are saved per-repository:

```
your-project/
└── .claude-context/
    └── state-2025-01-15-14-30.json
```

## Manual Commands

```bash
# Manually load previous state
.context-load
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run specific test
npm test -- tests/config.test.js
```

## Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Architecture](docs/ARCHITECTURE.md)

## License

MIT
