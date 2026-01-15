#!/usr/bin/env node
// lib/save-state.js

const fs = require('fs').promises;
const path = require('path');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    result[key] = value;
  }

  return result;
}

/**
 * Main entry point
 */
async function main() {
  const args = parseArgs();

  const workingDir = args['working-dir'] || process.cwd();
  const contextUsage = args['context-usage'] || '0%';
  const timestamp = args['timestamp'] || new Date().toISOString();

  // Import state manager
  const stateManager = require('./state-manager');

  // Save state
  const savedPath = await stateManager.saveState({
    workingDirectory: workingDir,
    timestamp,
    contextUsage: parseInt(contextUsage.replace('%', ''), 10)
  });

  console.error(`[Context Spawner] State saved to: ${savedPath}`);
}

main().catch(error => {
  console.error(`[Context Spawner] Error: ${error.message}`);
  process.exit(1);
});
