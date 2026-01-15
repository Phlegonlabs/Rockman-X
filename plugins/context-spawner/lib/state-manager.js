// lib/state-manager.js
const fs = require('fs').promises;
const path = require('path');
const cleanup = require('./cleanup');
const config = require('./config');

/**
 * Save current session state to repository
 * @param {Object} options - State save options
 * @param {string} options.workingDirectory - Repository path
 * @param {string} options.timestamp - ISO timestamp
 * @param {number} options.contextUsage - Context usage percentage
 * @returns {Promise<string>} Path to saved state file
 */
async function saveState({ workingDirectory, timestamp, contextUsage }) {
  const contextDir = path.join(workingDirectory, '.claude-context');

  // Ensure .claude-context directory exists
  await fs.mkdir(contextDir, { recursive: true });

  // Generate filename with timestamp
  const date = new Date(timestamp);
  const filename = `state-${formatTimestamp(date)}.json`;
  const filepath = path.join(contextDir, filename);

  // Build state object
  const state = await buildStateObject({
    repository: path.basename(workingDirectory),
    timestamp,
    contextUsage,
    workingDirectory
  });

  // Write to file
  await fs.writeFile(filepath, JSON.stringify(state, null, 2), 'utf-8');

  // Cleanup old states after saving
  const cfg = await config.loadConfig();
  if (cfg.autoCleanup) {
    await cleanup.cleanupOldStates(workingDirectory, cfg.maxStates);
  }

  return filepath;
}

/**
 * Format timestamp for filename
 * @param {Date} date - Date object
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}-${hours}-${minutes}`;
}

/**
 * Build complete state object
 * @param {Object} params - State parameters
 * @returns {Promise<Object>} Complete state object
 */
async function buildStateObject({ repository, timestamp, contextUsage, workingDirectory }) {
  const fileSnapshot = await captureFileSnapshot(workingDirectory);

  return {
    metadata: {
      repository,
      timestamp,
      contextUsageAtCapture: `${contextUsage}%`
    },
    conversationSummary: {
      keyDecisions: [],
      codeChanges: [],
      unresolvedIssues: []
    },
    tasks: [],
    fileSnapshot,
    preferences: {},
    errorLog: []
  };
}

/**
 * Capture file snapshot including git status
 * @param {string} workingDirectory - Repository path
 * @returns {Promise<Object>} File snapshot
 */
async function captureFileSnapshot(workingDirectory) {
  try {
    const { execSync } = require('child_process');

    // Check if it's a git repository
    execSync('git rev-parse --git-dir', {
      cwd: workingDirectory,
      stdio: 'ignore'
    });

    // Get git status
    const gitStatus = execSync('git status --short', {
      cwd: workingDirectory,
      encoding: 'utf-8'
    }).trim();

    // Parse modified files
    const modifiedFiles = parseGitStatus(gitStatus);

    return {
      workingDirectory,
      gitStatus: gitStatus || null,
      modifiedFiles
    };
  } catch (error) {
    // Not a git repository or git not available
    return {
      workingDirectory,
      gitStatus: null,
      modifiedFiles: []
    };
  }
}

/**
 * Parse git status output to extract modified files
 * @param {string} gitStatus - Output from git status --short
 * @returns {string[]} List of modified files
 */
function parseGitStatus(gitStatus) {
  if (!gitStatus) return [];

  return gitStatus
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const parts = line.trim().split(/\s+/);
      return parts.slice(1).join(' ');
    });
}

module.exports = {
  saveState,
  formatTimestamp,
  buildStateObject,
  captureFileSnapshot,
  parseGitStatus
};
