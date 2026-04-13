const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

router.get('/', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City is required' });

    const weather = await weatherService.fetchWeatherByCity(city);
    res.json(weather);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

module.exports = router;
