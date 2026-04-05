const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/history.json');

// Ensure data directory exists
function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

function readHistory() {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeHistory(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function saveGeneration(entry) {
  const history = readHistory();
  const newEntry = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  history.unshift(newEntry); // newest first
  // Keep max 50 entries
  const trimmed = history.slice(0, 50);
  writeHistory(trimmed);
  return newEntry;
}

function getHistory() {
  return readHistory();
}

function deleteEntry(id) {
  const history = readHistory();
  const filtered = history.filter(h => h.id !== id);
  if (filtered.length === history.length) return false;
  writeHistory(filtered);
  return true;
}

module.exports = { saveGeneration, getHistory, deleteEntry };
