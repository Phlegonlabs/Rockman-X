# Architecture

## System Overview

```
+----------------------------------------------------+
|                   Claude Code CLI                   |
+---------------------+------------------------------+
                      |
             +--------+--------+
             |                 |
             v                 v
    +-----------------+  +-----------------+
    | post-response   |  |  pre-session    |
    |     Hook        |  |     Hook        |
    +--------+--------+  +--------+--------+
             |                    |
             +--------+-----------+
                      v
             +-----------------+
             |  State Manager  |
             |    (lib/)       |
             +-----------------+
```

## Data Flow

### State Save Flow

```
Turn Complete
    |
    v
post-response Hook Triggered
    |
    v
Check Context Usage (from env var)
    |
    v
>= 65%? --No--> Exit
    | Yes
    v
Call save-state.js
    |
    v
Collect State:
  - Conversation summary
  - Tasks (TODO list)
  - File snapshot (git status)
  - Preferences
  - Error log
    |
    v
Save to .claude-context/state-{timestamp}.json
    |
    v
Display Notification
    |
    v
Auto-cleanup old states (if enabled)
```

### State Restoration Flow

```
New Session Starts
    |
    v
pre-session Hook Triggered
    |
    v
Check for .claude-context/
    |
    v
Found? --No--> Exit
    | Yes
    v
Call restore-state.js
    |
    v
Find latest state file
    |
    v
Load and parse JSON
    |
    v
Display restoration summary
    |
    v
User continues with restored context
```

## Repository Isolation

Each repository maintains its own state:

```
project-a/.claude-context/state-2025-01-15-14-30.json
project-b/.claude-context/state-2025-01-15-15-00.json
```

State is **never** shared between repositories.

## File Structure

```
context-spawner/
├── plugin.yaml              # Plugin manifest
├── hooks/
│   ├── post-response.sh     # Triggered after each turn
│   └── pre-session.sh       # Triggered before new session
├── lib/
│   ├── save-state.js        # Entry point for saving
│   ├── restore-state.js     # Entry point for restoration
│   ├── state-manager.js     # State management core
│   ├── restoration.js       # State restoration logic
│   ├── notification.js      # Notification formatting
│   ├── config.js            # Configuration management
│   └── cleanup.js           # Auto-cleanup old states
├── tests/
│   ├── hooks/
│   │   ├── post-response.test.js
│   │   └── pre-session.test.js
│   ├── config.test.js
│   ├── cleanup.test.js
│   ├── save-state.test.js
│   ├── restoration.test.js
│   ├── notification.test.js
│   └── integration/
│       └── e2e.test.js
├── docs/
│   ├── INSTALLATION.md
│   └── ARCHITECTURE.md
├── package.json
├── README.md
└── .gitignore
```

## State Schema

```json
{
  "metadata": {
    "repository": "string",
    "timestamp": "ISO 8601",
    "contextUsageAtCapture": "string (e.g., '67%')"
  },
  "conversationSummary": {
    "keyDecisions": "string[]",
    "codeChanges": "string[]",
    "unresolvedIssues": "string[]"
  },
  "tasks": [
    {
      "content": "string",
      "status": "pending|in_progress|completed"
    }
  ],
  "fileSnapshot": {
    "workingDirectory": "string",
    "gitStatus": "string|null",
    "modifiedFiles": "string[]"
  },
  "preferences": {},
  "errorLog": []
}
```

## Key Design Decisions

### Why Plugin + Hooks?

- **Automatic**: Hooks trigger automatically at lifecycle points
- **Non-invasive**: No modification to Claude Code needed
- **Simple**: Shell scripts + Node.js, no server required
- **Reliable**: Deterministic execution, can be disabled anytime

### Why Per-Repository?

- Isolation prevents cross-contamination
- Teams can share state via git (optional)
- Natural fit for git-based workflows
- Simpler mental model

### Why JSON?

- Human-readable and editable
- Easy to debug
- Works with git (can diff state files)
- No external dependencies

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| chalk | ^4.1.2 | Terminal colors |
| jest | ^29.7.0 | Testing |
| eslint | ^8.57.0 | Linting |
| prettier | ^3.2.5 | Formatting |
