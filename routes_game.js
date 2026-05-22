const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// الحصول على جميع الألعاب
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// الحصول على تفاصيل لعبة معينة
router.get('/:gameId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'اللعبة غير موجودة' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;