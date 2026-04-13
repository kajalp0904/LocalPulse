const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City is required' });

    const posts = await Post.find({ city, isModerated: true });
    
    // Count posts by category
    const categoryCount = {};
    posts.forEach(p => {
        const cat = p.category || 'general';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // Extract most common words from titles
    const wordsCount = {};
    const stopWords = ['the', 'and', 'in', 'on', 'to', 'a', 'of', 'for', 'is', 'with', 'at', 'from', 'by', 'this', 'that'];
    posts.forEach(p => {
        const words = p.title.toLowerCase().split(/\W+/);
        words.forEach(w => {
            if (w.length > 3 && !stopWords.includes(w)) {
                wordsCount[w] = (wordsCount[w] || 0) + 1;
            }
        });
    });

    const trendingKeywords = Object.entries(wordsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => ({ text: entry[0], value: entry[1] }));

    // Count totals
    const totalPosts = posts.length;
    const totalUpvotes = posts.reduce((sum, p) => sum + p.upvotes.length, 0);
    const activeUsers = await User.countDocuments({ city });

    res.json({
        totalPosts,
        totalUpvotes,
        activeUsers,
        postsByCategory: Object.entries(categoryCount).map(([name, value]) => ({ name, value })),
        trendingKeywords
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
