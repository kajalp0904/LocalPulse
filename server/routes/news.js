const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const claudeService = require('../services/claudeService');

router.get('/', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City is required' });

    const articles = await newsService.fetchNewsByCity(city);
    if (articles.length === 0) return res.json([]);

    // AI categorizes AND checks city relevance in ONE call
    const categories = await claudeService.categorizeArticles(articles, city);

    // Build result and REMOVE irrelevant articles
    const result = articles
      .map((article, i) => ({
        ...article,
        aiSummary: article.description || "No summary available.",
        detectedCategory: categories[i] || 'General'
      }))
      .filter(a => a.detectedCategory !== 'IRRELEVANT');

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;
