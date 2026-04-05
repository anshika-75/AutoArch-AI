const express = require('express');
const { getHistory, deleteEntry } = require('../utils/history');

const router = express.Router();

// GET /api/history - get all history
router.get('/', (req, res) => {
  try {
    const history = getHistory();
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve history.' });
  }
});

// DELETE /api/history/:id
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteEntry(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Entry not found.' });
    res.json({ success: true, message: 'Entry deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
});

module.exports = router;
