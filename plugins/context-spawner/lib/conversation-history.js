// lib/conversation-history.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Find the most recent JSONL file for a given working directory
 * @param {string} workingDirectory - Repository path
 * @returns {Promise<string|null>} Path to the most recent JSONL file or null
 */
async function findLatestConversationFile(workingDirectory) {
  const claudeDir = path.join(workingDirectory, '.claude');
  const projectsDir = path.join(claudeDir, 'projects');

  try {
    await fs.access(projectsDir);
  } catch {
    return null;
  }

  // Find project directories that match the working directory pattern
  const entries = await fs.readdir(projectsDir, { withFileTypes: true });

  // Filter for project directories and sort by modification time
  const projectDirs = entries
    .filter(entry => entry.isDirectory())
    .sort((a, b) => {
      const statA = fs.statSync(path.join(projectsDir, a.name));
      const statB = fs.statSync(path.join(projectsDir, b.name));
      return statB.mtimeMs - statA.mtimeMs; // Newest first
    });

  // Look for JSONL files in the most recent project directories
  for (const dir of projectDirs.slice(0, 3)) {
    const dirPath = path.join(projectsDir, dir.name);
    const files = await fs.readdir(dirPath);

    // Find non-agent JSONL files (actual conversation files)
    const jsonlFiles = files.filter(f =>
      f.endsWith('.jsonl') &&
      !f.startsWith('agent-') &&
      !f.startsWith('subagents/')
    );

    if (jsonlFiles.length > 0) {
      // Sort by modification time and get the newest
      const sorted = jsonlFiles.sort((a, b) => {
        const statA = fs.statSync(path.join(dirPath, a));
        const statB = fs.statSync(path.join(dirPath, b));
        return statB.mtimeMs - statA.mtimeMs;
      });

      return path.join(dirPath, sorted[0]);
    }
  }

  return null;
}

/**
 * Extract text content from a message content array
 * @param {Array} content - Message content array
 * @returns {string} Extracted text
 */
function extractTextContent(content) {
  if (!content) return '';

  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');
  }

  return '';
}

/**
 * Read and parse conversation history from JSONL file
 * @param {string} workingDirectory - Repository path
 * @param {number} maxMessages - Maximum number of messages to capture
 * @returns {Promise<Object>} Conversation history object
 */
async function readConversationHistory(workingDirectory, maxMessages = 50) {
  const jsonlFile = await findLatestConversationFile(workingDirectory);

  if (!jsonlFile) {
    return {
      messages: [],
      summary: null,
      lastActivity: null
    };
  }

  try {
    const content = await fs.readFile(jsonlFile, 'utf-8');
    const lines = content.trim().split('\n');

    const messages = [];
    const summaries = [];

    // Parse JSONL lines (process from newest to oldest)
    for (let i = lines.length - 1; i >= 0 && messages.length < maxMessages; i--) {
      try {
        const line = lines[i];
        if (!line.trim()) continue;

        const entry = JSON.parse(line);

        // Capture summary entries
        if (entry.type === 'summary' && entry.summary) {
          summaries.unshift(entry.summary);
        }

        // Capture user and assistant messages
        if ((entry.type === 'user' || entry.type === 'assistant') && entry.message) {
          const msg = entry.message;
          const role = msg.role || (entry.type === 'user' ? 'user' : 'assistant');

          // Skip meta messages
          if (entry.isMeta) continue;

          const textContent = extractTextContent(msg.content);

          if (textContent && textContent.length > 0) {
            messages.unshift({
              role,
              content: textContent,
              timestamp: entry.timestamp,
              model: msg.model || null
            });
          }
        }
      } catch (parseError) {
        // Skip malformed lines
        continue;
      }
    }

    // Get file modification time as last activity
    const stats = await fs.stat(jsonlFile);

    return {
      messages,
      summary: summaries.length > 0 ? summaries[summaries.length - 1] : null,
      lastActivity: stats.mtime.toISOString()
    };
  } catch (error) {
    console.error(`[Context Spawner] Error reading conversation history: ${error.message}`);
    return {
      messages: [],
      summary: null,
      lastActivity: null
    };
  }
}

/**
 * Generate a summary of key decisions from conversation
 * @param {Array} messages - Conversation messages
 * @returns {Array} Key decisions
 */
function extractKeyDecisions(messages) {
  const decisions = [];

  // Look for common decision markers
  const decisionPatterns = [
    /decided[:\s]+(.+)/i,
    /will use[:\s]+(.+)/i,
    /choose[d]?[:\s]+(.+)/i,
    /agreed[:\s]+(.+)/i,
    /let's go with[:\s]+(.+)/i,
    /I think.+is better/i,
    /recommend[:\s]+(.+)/i
  ];

  for (const msg of messages.slice(-20)) { // Check last 20 messages
    if (msg.role === 'user') {
      for (const pattern of decisionPatterns) {
        const match = msg.content.match(pattern);
        if (match) {
          decisions.push(match[1].trim());
        }
      }
    }
  }

  return decisions.slice(-10); // Return last 10 decisions
}

module.exports = {
  findLatestConversationFile,
  readConversationHistory,
  extractKeyDecisions
};
