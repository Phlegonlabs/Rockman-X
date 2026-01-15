const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

describe('Save State Entry Point', () => {
  let tempDir;
  let testRepoPath;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccs-save-'));
    testRepoPath = path.join(tempDir, 'test-repo');
    await fs.mkdir(testRepoPath, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should create state file when called', async () => {
    const result = await spawnSaveState({
      workingDir: testRepoPath,
      contextUsage: '67%',
      timestamp: '2025-01-15T14:30:00Z'
    });

    expect(result.code).toBe(0);

    const contextDir = path.join(testRepoPath, '.claude-context');
    const files = await fs.readdir(contextDir);

    expect(files.length).toBeGreaterThan(0);
    expect(files[0]).toMatch(/state-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.json$/);
  });

  test('should include metadata in state file', async () => {
    await spawnSaveState({
      workingDir: testRepoPath,
      contextUsage: '67%',
      timestamp: '2025-01-15T14:30:00Z'
    });

    const contextDir = path.join(testRepoPath, '.claude-context');
    const files = await fs.readdir(contextDir);
    const statePath = path.join(contextDir, files[0]);
    const state = JSON.parse(await fs.readFile(statePath, 'utf-8'));

    expect(state.metadata).toBeDefined();
    expect(state.metadata.repository).toBe('test-repo');
    expect(state.metadata.contextUsageAtCapture).toBe('67%');
  });
});

// Helper function
async function spawnSaveState({ workingDir, contextUsage, timestamp }) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [
      './lib/save-state.js',
      '--working-dir', workingDir,
      '--context-usage', contextUsage,
      '--timestamp', timestamp
    ]);

    let output = '';
    let error = '';

    proc.stdout.on('data', (data) => output += data);
    proc.stderr.on('data', (data) => error += data);

    proc.on('close', (code) => {
      resolve({ code, output, error });
    });

    proc.on('error', reject);
  });
}
