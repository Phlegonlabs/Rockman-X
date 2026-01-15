const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('State Restoration', () => {
  let tempDir;
  let testRepoPath;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccs-restore-'));
    testRepoPath = path.join(tempDir, 'test-repo');
    await fs.mkdir(testRepoPath, { recursive: true });

    // Create a sample state file
    const contextDir = path.join(testRepoPath, '.claude-context');
    await fs.mkdir(contextDir);
    await fs.writeFile(path.join(contextDir, 'state-2025-01-15-14-30.json'), JSON.stringify({
      metadata: { repository: 'test-repo', timestamp: '2025-01-15T14:30:00Z' },
      tasks: [{ content: 'Test task', status: 'pending' }],
      fileSnapshot: { modifiedFiles: ['test.js'] }
    }));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should find latest state file in repository', async () => {
    const restoration = require('../lib/restoration');
    const latest = await restoration.findLatestState(testRepoPath);

    expect(latest).toBeDefined();
    expect(latest).toContain('state-2025-01-15-14-30.json');
  });

  test('should return null when no state files exist', async () => {
    const restoration = require('../lib/restoration');
    const emptyRepo = path.join(tempDir, 'empty-repo');
    await fs.mkdir(emptyRepo);

    const latest = await restoration.findLatestState(emptyRepo);

    expect(latest).toBeNull();
  });

  test('should load and parse state file', async () => {
    const restoration = require('../lib/restoration');
    const latest = await restoration.findLatestState(testRepoPath);
    const state = await restoration.loadState(latest);

    expect(state.metadata.repository).toBe('test-repo');
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].content).toBe('Test task');
  });

  test('should format restoration message', async () => {
    const restoration = require('../lib/restoration');
    const latest = await restoration.findLatestState(testRepoPath);
    const state = await restoration.loadState(latest);
    const message = restoration.formatRestorationMessage(state);

    expect(message).toContain('test-repo');
    expect(message).toContain('Test task');
    expect(message).toContain('test.js');
  });
});
