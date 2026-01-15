// lib/restoration.js
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Find latest state file in repository
 * @param {string} workingDirectory - Repository path
 * @returns {Promise<string|null>} Path to latest state file or null
 */
async function findLatestState(workingDirectory) {
  const contextDir = path.join(workingDirectory, '.claude-context');

  try {
    await fs.access(contextDir);
  } catch {
    return null; // Directory doesn't exist
  }

  const files = await fs.readdir(contextDir);
  const stateFiles = files
    .filter(f => f.startsWith('state-') && f.endsWith('.json'))
    .sort()
    .reverse(); // Latest first

  return stateFiles.length > 0
    ? path.join(contextDir, stateFiles[0])
    : null;
}

/**
 * Load state from file
 * @param {string} filepath - Path to state file
 * @returns {Promise<Object>} Parsed state object
 */
async function loadState(filepath) {
  const content = await fs.readFile(filepath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Format restoration message for display
 * @param {Object} state - State object
 * @returns {string} Formatted message
 */
function formatRestorationMessage(state) {
  const { metadata, tasks = [], fileSnapshot = {} } = state;
  const modifiedFiles = fileSnapshot.modifiedFiles || [];

  const repo = metadata.repository ? chalk.bold(`[${metadata.repository}]`) : '';

  const lines = [
    chalk.bold('═══ 狀態詳情 ═══'),
    '',
    `${chalk.cyan('來自上一個會話的狀態')} ${repo}`,
    chalk.bold('========================================'),
  ];

  // Context summary
  if (tasks.length > 0) {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;

    lines.push('');
    lines.push(chalk.bold('任務狀態:'));
    if (completed > 0) lines.push(`  已完成: ${completed} 個`);
    if (inProgress > 0) lines.push(`  進行中: ${inProgress} 個`);
    if (pending > 0) lines.push(`  待辦: ${pending} 個`);
  }

  // Task list
  if (tasks.length > 0) {
    lines.push('');
    lines.push(chalk.bold('待辦事項:'));
    tasks.forEach(task => {
      const icon = task.status === 'completed' ? '[+]' : '[-]';
      lines.push(`  ${icon} ${task.content}`);
    });
  }

  // Modified files
  if (modifiedFiles.length > 0) {
    lines.push('');
    lines.push(chalk.bold('已修改文件:'));
    modifiedFiles.forEach(file => {
      lines.push(`  * ${file}`);
    });
  }

  // Git status warning
  if (fileSnapshot.gitStatus) {
    lines.push('');
    lines.push(chalk.yellow('未提交變更: ') + modifiedFiles.length + ' 個文件');
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Display restoration notification
 * @param {Object} state - State object
 */
function displayRestoration(state) {
  const message = formatRestorationMessage(state);

  const boxen = require('cli-boxes');
  const box = boxen(message, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'blue'
  });

  console.error('\n' + box + '\n');
}

module.exports = {
  findLatestState,
  loadState,
  formatRestorationMessage,
  displayRestoration
};
