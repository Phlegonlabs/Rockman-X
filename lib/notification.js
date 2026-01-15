// lib/notification.js
const chalk = require('chalk');
const boxen = require('cli-boxes');

/**
 * Format state save notification
 * @param {Object} state - Saved state object
 * @param {string} filepath - Path to saved state file
 * @returns {string} Formatted notification
 */
function formatNotification(state, filepath) {
  const { metadata, tasks = [], fileSnapshot = {} } = state;
  const modifiedFiles = fileSnapshot.modifiedFiles || [];

  const repo = chalk.bold(`[${metadata.repository}]`);
  const taskCount = tasks.length;
  const fileCount = modifiedFiles.length;

  const filename = filepath ? filepath.split('/').pop().split('\\').pop() : 'state-*.json';

  const lines = [
    `${chalk.green('✓')} ${repo} 新對話窗口已創建`,
    `上下文使用率: ${chalk.yellow(metadata.contextUsageAtCapture)}`,
    `狀態已保存到 ${chalk.cyan(filename)}`,
    `傳承: 對話摘要, ${taskCount}個待辦, ${fileCount}個已修改文件`,
    '',
    `[Enter 繼續 | 'details' 查看詳情 | 'undo' 撤銷]`
  ];

  return lines.join('\n');
}

/**
 * Display notification to console
 * @param {string} message - Notification message
 */
function displayNotification(message) {
  const box = boxen(message, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'green'
  });

  console.error('\n' + box + '\n');
}

module.exports = {
  formatNotification,
  displayNotification
};
