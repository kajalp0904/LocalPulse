const express = require('express');
const router = express.Router();
const jobsService = require('../services/jobsService');

router.get('/', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City is required' });

    const jobs = await jobsService.fetchJobsByCity(city);
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router;
