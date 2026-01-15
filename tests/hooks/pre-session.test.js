const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('Pre-Session Hook', () => {
  let tempDir;
  let testRepoPath;
  let hookPath;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccs-pre-'));
    testRepoPath = path.join(tempDir, 'test-repo');
    await fs.mkdir(testRepoPath, { recursive: true });

    hookPath = path.join(tempDir, 'pre-session.sh');
    await fs.writeFile(hookPath, '#!/bin/bash\nexit 0', { mode: 0o755 });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should restore state when .claude-context exists', async () => {
    // Create a state file
    const contextDir = path.join(testRepoPath, '.claude-context');
    await fs.mkdir(contextDir);
    await fs.writeFile(path.join(contextDir, 'state-2025-01-15-14-30.json'), JSON.stringify({
      metadata: { repository: 'test-repo' }
    }));

    const env = {
      CLAUDE_WORKING_DIR: testRepoPath
    };

    expect(() => {
      execSync(`"${hookPath}"`, {
        env: { ...process.env, ...env }
      });
    }).not.toThrow();
  });

  test('should handle missing .claude-context gracefully', () => {
    const env = {
      CLAUDE_WORKING_DIR: testRepoPath
    };

    expect(() => {
      execSync(`"${hookPath}"`, {
        env: { ...process.env, ...env }
      });
    }).not.toThrow();
  });
});
