// lib/cleanup.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Clean up old state files, keeping only the most recent ones
 * @param {string} workingDirectory - Repository path
 * @param {number} maxStates - Maximum number of states to keep
 * @returns {Promise<number>} Number of files deleted
 */
async function cleanupOldStates(workingDirectory, maxStates = 3) {
  const contextDir = path.join(workingDirectory, '.claude-context');

  try {
    await fs.access(contextDir);
  } catch {
    return 0; // Directory doesn't exist
  }

  const files = await fs.readdir(contextDir);
  const stateFiles = files
    .filter(f => f.startsWith('state-') && f.endsWith('.json'))
    .sort(); // Oldest first

  if (stateFiles.length <= maxStates) {
    return 0; // Nothing to delete
  }

  // Delete oldest files
  const toDelete = stateFiles.slice(0, stateFiles.length - maxStates);
  let deletedCount = 0;

  for (const file of toDelete) {
    const filepath = path.join(contextDir, file);
    await fs.unlink(filepath);
    deletedCount++;
  }

  return deletedCount;
}

module.exports = { cleanupOldStates };
