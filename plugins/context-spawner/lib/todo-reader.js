// lib/todo-reader.js
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Find the todo file for the current session
 * @param {string} workingDirectory - Repository path
 * @returns {Promise<string|null>} Path to the todo file or null
 */
async function findTodoFile(workingDirectory) {
  const todoDir = path.join(os.homedir(), '.claude', 'todos');

  try {
    const files = await fs.readdir(todoDir);

    // Filter for files matching the session pattern
    // The pattern is: <session-id>-agent-<session-id>.json
    const sessionFiles = files.filter(f => f.endsWith('.json'));

    // Sort by modification time (newest first)
    const sorted = sessionFiles.sort((a, b) => {
      const statA = fs.statSync(path.join(todoDir, a));
      const statB = fs.statSync(path.join(todoDir, b));
      return statB.mtimeMs - statA.mtimeMs;
    });

    // Try to find a todo file that matches the current project
    // by checking the most recent files first
    for (const file of sorted.slice(0, 10)) {
      const filePath = path.join(todoDir, file);
      const content = await fs.readFile(filePath, 'utf-8');

      try {
        const todos = JSON.parse(content);
        if (Array.isArray(todos) && todos.length > 0) {
          return filePath;
        }
      } catch {
        continue;
      }
    }

    // If no todos found, return the most recent file anyway
    if (sorted.length > 0) {
      return path.join(todoDir, sorted[0]);
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return null;
}

/**
 * Read todos from the todo file
 * @param {string} workingDirectory - Repository path
 * @returns {Promise<Array>} Array of todo items
 */
async function readTodos(workingDirectory) {
  const todoFile = await findTodoFile(workingDirectory);

  if (!todoFile) {
    return [];
  }

  try {
    const content = await fs.readFile(todoFile, 'utf-8');
    const todos = JSON.parse(content);

    if (!Array.isArray(todos)) {
      return [];
    }

    // Filter out completed todos if desired, or return all
    return todos.map(todo => ({
      content: todo.content || '',
      status: todo.status || 'pending',
      activeForm: todo.activeForm || todo.content || ''
    })).filter(todo => todo.content);
  } catch (error) {
    console.error(`[Context Spawner] Error reading todos: ${error.message}`);
    return [];
  }
}

/**
 * Count todos by status
 * @param {Array} todos - Array of todo items
 * @returns {Object} Counts by status
 */
function countTodosByStatus(todos) {
  return {
    total: todos.length,
    completed: todos.filter(t => t.status === 'completed').length,
    in_progress: todos.filter(t => t.status === 'in_progress').length,
    pending: todos.filter(t => t.status === 'pending').length
  };
}

module.exports = {
  findTodoFile,
  readTodos,
  countTodosByStatus
};
