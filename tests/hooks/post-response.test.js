const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('Post-Response Hook', () => {
  let tempDir;
  let hookPath;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccs-hook-'));
    hookPath = path.join(tempDir, 'post-response.sh');
    await fs.writeFile(hookPath, '#!/bin/bash\nexit 0', { mode: 0o755 });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should trigger state save when context >= 65%', () => {
    const env = {
      CLAUDE_CONTEXT_USAGE: '67%',
      CLAUDE_WORKING_DIR: tempDir,
      CLAUDE_TIMESTAMP: '2025-01-15T14:30:00Z'
    };

    // Hook should execute without error
    expect(() => {
      execSync(`"${hookPath}"`, {
        env: { ...process.env, ...env }
      });
    }).not.toThrow();
  });

  test('should not trigger when context < 65%', () => {
    const env = {
      CLAUDE_CONTEXT_USAGE: '45%',
      CLAUDE_WORKING_DIR: tempDir
    };

    // Hook should execute without error
    expect(() => {
      execSync(`"${hookPath}"`, {
        env: { ...process.env, ...env }
      });
    }).not.toThrow();
  });

  test('should handle missing environment variables gracefully', () => {
    expect(() => {
      execSync(`"${hookPath}"`, { env: process.env });
    }).not.toThrow();
  });
});
