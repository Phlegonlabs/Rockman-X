// tests/config.test.js
const { loadConfig, getThreshold, DEFAULT_CONFIG } = require('../lib/config');

describe('Configuration', () => {
  test('should load default config when none exists', async () => {
    const config = await loadConfig();

    expect(config.threshold).toBe(65);
    expect(config.maxStates).toBe(3);
    expect(config.autoCleanup).toBe(true);
  });

  test('should merge user config with defaults', async () => {
    const config = await loadConfig({
      contextSpawner: {
        threshold: 80,
        maxStates: 5
      }
    });

    expect(config.threshold).toBe(80);
    expect(config.maxStates).toBe(5);
    expect(config.autoCleanup).toBe(true); // Default
  });

  test('should return default threshold via getThreshold', async () => {
    const threshold = await getThreshold();
    expect(threshold).toBe(65);
  });

  test('should expose DEFAULT_CONFIG', () => {
    expect(DEFAULT_CONFIG).toBeDefined();
    expect(DEFAULT_CONFIG.threshold).toBe(65);
    expect(DEFAULT_CONFIG.notificationStyle).toBe('compact');
  });
});
