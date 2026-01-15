#!/usr/bin/env node
// context-load.js

/**
 * Context Load - 手動恢復上一個會話的狀態
 *
 * 使用方式：在 Claude Code 輸入
 * .context-load
 */

const path = require('path');
const fs = require('fs').promises;

async function main() {
  const workingDir = process.cwd();
  const stateDir = path.join(workingDir, '.claude-context');

  // 尋找最新的 state 檔案
  let latestPath = null;
  try {
    const files = await fs.readdir(stateDir);
    const stateFiles = files
      .filter(f => f.startsWith('state-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (stateFiles.length > 0) {
      latestPath = path.join(stateDir, stateFiles[0]);
    }
  } catch {
    console.error('沒有找到任何 state 檔案。');
    console.error('請先在一個對話達到 65% context 時讓系統儲存狀態。');
    return;
  }

  if (!latestPath) {
    console.error('沒有找到任何 state 檔案。');
    return;
  }

  // 讀取並顯示 state
  const content = await fs.readFile(latestPath, 'utf-8');
  const state = JSON.parse(content);

  console.log('\n' + '='.repeat(50));
  console.log('  來自上一個會話的狀態 [' + state.metadata.repository + ']');
  console.log('='.repeat(50));
  console.log('  時間戳記: ' + state.metadata.timestamp);
  console.log('  Context 使用率: ' + state.metadata.contextUsageAtCapture);
  console.log('');

  // 顯示任務
  if (state.tasks && state.tasks.length > 0) {
    const pending = state.tasks.filter(t => t.status !== 'completed');

    if (pending.length > 0) {
      console.log('  待辦任務 (' + pending.length + ' 個):');
      console.log('');

      pending.forEach(task => {
        const icon = task.status === 'in_progress' ? '→' : '⏳';
        const status = task.status === 'in_progress' ? '[進行中]' : '[待辦]';
        console.log('  ' + icon + ' ' + status + ' ' + task.content);
      });
      console.log('');
    }
  }

  // 顯示已修改的檔案
  if (state.fileSnapshot && state.fileSnapshot.modifiedFiles && state.fileSnapshot.modifiedFiles.length > 0) {
    console.log('  已修改的檔案 (' + state.fileSnapshot.modifiedFiles.length + ' 個):');
    state.fileSnapshot.modifiedFiles.forEach(file => {
      console.log('  * ' + file);
    });
    console.log('');
  }

  console.log('='.repeat(50));
  console.log('  輸入 /continue 或直接繼續對話');
  console.log('='.repeat(50) + '\n');
}

main().catch(error => {
  console.error('錯誤: ' + error.message);
});
