# Claude Code Context Spawner

> Automatically save and restore Claude Code session state when context window reaches threshold.

## Installation

```bash
/plugin install github:user/context-spawner
```

Or from local:

```bash
/plugin install ./context-spawner
```

## Configuration

The plugin uses default configuration, but you can override in `~/.claude/config.json`:

```json
{
  "contextSpawner": {
    "threshold": 65,
    "maxStates": 3,
    "autoCleanup": true
  }
}
```

## Usage

The plugin works automatically:
1. Monitors context usage after each turn (via post-response hook)
2. Saves state when reaching threshold (default: 65%)
3. Restores state in new sessions (via pre-session hook)

## State File Location

States are saved per-repository: `.claude-context/state-{timestamp}.json`
