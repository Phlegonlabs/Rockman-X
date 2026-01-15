// lib/config.js
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const DEFAULT_CONFIG = {
  threshold: 65,
  maxStates: 3,
  autoCleanup: true,
  notificationStyle: 'compact',
  restoreOnNewSession: true
};

/**
 * Load configuration from Claude Code config
 * @param {Object} mockConfig - Mock config for testing
 * @returns {Promise<Object>} Merged configuration
 */
async function loadConfig(mockConfig = null) {
  if (mockConfig) {
    return { ...DEFAULT_CONFIG, ...mockConfig.contextSpawner };
  }

  try {
    const configPath = path.join(os.homedir(), '.claude', 'config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const userConfig = JSON.parse(configContent);

    return {
      ...DEFAULT_CONFIG,
      ...(userConfig.contextSpawner || {})
    };
  } catch (error) {
    return DEFAULT_CONFIG;
  }
}

/**
 * Get threshold from config
 * @returns {Promise<number>} Threshold value
 */
async function getThreshold() {
  const config = await loadConfig();
  return config.threshold;
}

module.exports = {
  loadConfig,
  getThreshold,
  DEFAULT_CONFIG
};
