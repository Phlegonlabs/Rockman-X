// tests/integration/e2e.test.js
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

describe('End-to-End Integration', () => {
  let tempDir;
  let testRepoPath;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccs-e2e-'));
    testRepoPath = path.join(tempDir, 'test-repo');
    await fs.mkdir(testRepoPath, { recursive: true });

    // Initialize git repo
    execSync('git init', { cwd: testRepoPath, stdio: 'ignore' });
    execSync('git config user.email "test@example.com"', { cwd: testRepoPath, stdio: 'ignore' });
    execSync('git config user.name "Test User"', { cwd: testRepoPath, stdio: 'ignore' });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('complete workflow: trigger, save, restore', async () => {
    const stateManager = require('../../lib/state-manager');
    const restoration = require('../../lib/restoration');

    // Step 1: Save state
    const savedPath = await stateManager.saveState({
      workingDirectory: testRepoPath,
      timestamp: '2025-01-15T14:30:00Z',
      contextUsage: 67
    });

    const exists = await fs.access(savedPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    // Step 2: Find and restore state
    const latestPath = await restoration.findLatestState(testRepoPath);
    expect(latestPath).toBe(savedPath);

    const restoredState = await restoration.loadState(latestPath);
    expect(restoredState.metadata.repository).toBe('test-repo');
    expect(restoredState.metadata.contextUsageAtCapture).toBe('67%');
  });

  test('should handle multiple repositories independently', async () => {
    const repoA = path.join(tempDir, 'repo-a');
    const repoB = path.join(tempDir, 'repo-b');
    await fs.mkdir(repoA);
    await fs.mkdir(repoB);

    const stateManager = require('../../lib/state-manager');
    const restoration = require('../../lib/restoration');

    // Save state in repo-a
    await stateManager.saveState({
      workingDirectory: repoA,
      timestamp: '2025-01-15T14:30:00Z',
      contextUsage: 67
    });

    // Save state in repo-b
    await stateManager.saveState({
      workingDirectory: repoB,
      timestamp: '2025-01-15T15:00:00Z',
      contextUsage: 70
    });

    // Verify independence
    const stateA = await restoration.loadState(await restoration.findLatestState(repoA));
    const stateB = await restoration.loadState(await restoration.findLatestState(repoB));

    expect(stateA.metadata.repository).toBe('repo-a');
    expect(stateB.metadata.repository).toBe('repo-b');
    expect(stateA.metadata.contextUsageAtCapture).toBe('67%');
    expect(stateB.metadata.contextUsageAtCapture).toBe('70%');
  });

  test('should auto-cleanup old states after save', async () => {
    const stateManager = require('../../lib/state-manager');

    // Save multiple states
    const timestamps = [
      '2025-01-15T10:00:00Z',
      '2025-01-15T11:00:00Z',
      '2025-01-15T12:00:00Z',
      '2025-01-15T13:00:00Z',
      '2025-01-15T14:00:00Z'
    ];

    for (const ts of timestamps) {
      await stateManager.saveState({
        workingDirectory: testRepoPath,
        timestamp: ts,
        contextUsage: 67
      });
    }

    // Should only have 3 files (default maxStates)
    const contextDir = path.join(testRepoPath, '.claude-context');
    const files = await fs.readdir(contextDir);
    const stateFiles = files.filter(f => f.startsWith('state-') && f.endsWith('.json'));

    expect(stateFiles.length).toBe(3);
  });

  test('should capture git status in state', async () => {
    const stateManager = require('../../lib/state-manager');

    // Create an untracked file
    await fs.writeFile(path.join(testRepoPath, 'test.js'), 'console.log("test");');

    const savedPath = await stateManager.saveState({
      workingDirectory: testRepoPath,
      timestamp: '2025-01-15T14:30:00Z',
      contextUsage: 67
    });

    const state = JSON.parse(await fs.readFile(savedPath, 'utf-8'));

    expect(state.fileSnapshot.gitStatus).toContain('test.js');
    expect(state.fileSnapshot.modifiedFiles).toContain('test.js');
  });

  test('should handle non-git directories gracefully', async () => {
    const stateManager = require('../../lib/state-manager');
    const nonGitRepo = path.join(tempDir, 'non-git-repo');
    await fs.mkdir(nonGitRepo);

    const savedPath = await stateManager.saveState({
      workingDirectory: nonGitRepo,
      timestamp: '2025-01-15T14:30:00Z',
      contextUsage: 67
    });

    const state = JSON.parse(await fs.readFile(savedPath, 'utf-8'));

    expect(state.fileSnapshot.gitStatus).toBeNull();
    expect(state.fileSnapshot.modifiedFiles).toEqual([]);
  });
});
