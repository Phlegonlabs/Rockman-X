#!/usr/bin/env node
// lib/restore-state.js

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

  // Import restoration module
  const restoration = require('./restoration');

  // Find latest state
  const latestPath = await restoration.findLatestState(workingDir);

  if (!latestPath) {
    // No state found, exit silently
    return;
  }

  // Load and display state
  const state = await restoration.loadState(latestPath);
  restoration.displayRestoration(state);
}

main().catch(error => {
  console.error(`[Context Spawner] Error: ${error.message}`);
  process.exit(0); // Don't fail the session
});
