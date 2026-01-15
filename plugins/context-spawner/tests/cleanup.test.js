// tests/cleanup.test.js
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { cleanupOldStates } = require('../lib/cleanup');

describe('Auto Cleanup', () => {
  let tempDir;
  let testRepoPath;
  let contextDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccs-cleanup-'));
    testRepoPath = path.join(tempDir, 'test-repo');
    await fs.mkdir(testRepoPath, { recursive: true });

    contextDir = path.join(testRepoPath, '.claude-context');
    await fs.mkdir(contextDir);

    // Create multiple state files
    const timestamps = [
      '2025-01-15-10-00',
      '2025-01-15-11-00',
      '2025-01-15-12-00',
      '2025-01-15-13-00',
      '2025-01-15-14-00'
    ];

    for (const ts of timestamps) {
      const filepath = path.join(contextDir, `state-${ts}.json`);
      await fs.writeFile(filepath, JSON.stringify({ timestamp: ts }));
    }
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should keep only maxStates most recent files', async () => {
    await cleanupOldStates(testRepoPath, 3);

    const files = await fs.readdir(contextDir);
    expect(files).toHaveLength(3);
    expect(files).toContain('state-2025-01-15-12-00.json');
    expect(files).toContain('state-2025-01-15-13-00.json');
    expect(files).toContain('state-2025-01-15-14-00.json');
  });

  test('should return number of deleted files', async () => {
    const deleted = await cleanupOldStates(testRepoPath, 3);
    expect(deleted).toBe(2);
  });

  test('should return 0 when fewer files than maxStates', async () => {
    const deleted = await cleanupOldStates(testRepoPath, 10);
    expect(deleted).toBe(0);

    const files = await fs.readdir(contextDir);
    expect(files).toHaveLength(5);
  });

  test('should return 0 when directory does not exist', async () => {
    const emptyRepo = path.join(tempDir, 'empty-repo');
    await fs.mkdir(emptyRepo);

    const deleted = await cleanupOldStates(emptyRepo, 3);
    expect(deleted).toBe(0);
  });

  test('should use default maxStates of 3', async () => {
    await cleanupOldStates(testRepoPath);

    const files = await fs.readdir(contextDir);
    expect(files).toHaveLength(3);
  });
});
