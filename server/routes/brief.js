const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const newsService = require('../services/newsService');
const weatherService = require('../services/weatherService');
const jobsService = require('../services/jobsService');
const claudeService = require('../services/claudeService');
const User = require('../models/User');

router.get('/', authMiddleware, async (req, res) => {
  try {
    // Priority: Query param city > User profile city
    const city = req.query.city || req.user.city;
    
    if (!city) {
      return res.status(400).json({ error: 'City is required for brief generation' });
    }
    const [news, weather, jobs] = await Promise.all([
      newsService.fetchNewsByCity(city),
      weatherService.fetchWeatherByCity(city),
      jobsService.fetchJobsByCity(city)
    ]);

    const briefString = await claudeService.generateMorningBrief(city, news, weather, jobs);

    // Save brief to user in MongoDB
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 
        latestBrief: briefString,
        latestBriefDate: new Date()
      }
    });

    res.json({ brief: briefString });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate brief' });
  }
});

module.exports = router;
