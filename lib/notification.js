// lib/notification.js
const chalk = require('chalk');

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
 * Draw a box around the message
 * @param {string} message - Message to box
 * @param {Object} options - Box options
 * @returns {string} Boxed message
 */
function drawBox(message, options = {}) {
  const {
    padding = 1,
    margin = { top: 0, bottom: 0, left: 0, right: 0 },
    borderStyle = 'round',
    borderColor = 'white'
  } = options;

  const lines = message.split('\n');
  const maxLength = Math.max(...lines.map(l => l.length));

  const horizontal = borderStyle === 'round' ? '─' : '-';
  const vertical = '│';
  const topLeft = borderStyle === 'round' ? '╭' : '+';
  const topRight = borderStyle === 'round' ? '╮' : '+';
  const bottomLeft = borderStyle === 'round' ? '╰' : '+';
  const bottomRight = borderStyle === 'round' ? '╯' : '+';

  // Apply color to border characters
  const coloredHorizontal = chalk[borderColor](horizontal);
  const coloredVertical = chalk[borderColor](vertical);
  const coloredCorners = chalk[borderColor];

  const topBorder = coloredCorners(topLeft) + coloredHorizontal.repeat(maxLength + padding * 2) + coloredCorners(topRight);
  const bottomBorder = coloredCorners(bottomLeft) + coloredHorizontal.repeat(maxLength + padding * 2) + coloredCorners(bottomRight);
  const middleLines = lines.map(line =>
    coloredVertical + ' '.repeat(padding) + line + ' '.repeat(maxLength - line.length + padding) + coloredVertical
  );

  const topMargin = ' '.repeat(margin.left) + '\n'.repeat(margin.top);
  const bottomMargin = '\n'.repeat(margin.bottom) + ' '.repeat(margin.left);

  return topMargin + topBorder + '\n' + middleLines.join('\n') + '\n' + bottomBorder + bottomMargin;
}

/**
 * Display notification to console
 * @param {string} message - Notification message
 */
function displayNotification(message) {
  const box = drawBox(message, {
    padding: 1,
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: 'green'
  });

  console.error('\n' + box + '\n');
}

module.exports = {
  formatNotification,
  displayNotification,
  drawBox
};
