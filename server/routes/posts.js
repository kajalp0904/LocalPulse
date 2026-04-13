const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const socketModule = require('../socket');
const claudeService = require('../services/claudeService');
const Post = require('../models/Post');

// GET /api/posts?city=Mumbai - fetch approved posts for city, sorted by upvotes
router.get('/', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City is required' });

    const posts = await Post.find({ city, isModerated: true })
                            .sort({ upvotes: -1, createdAt: -1 })
                            .populate('author', 'name');

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /api/posts - create new post (Protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, category, location } = req.body;
    const city = req.user.city;

    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

    // 1. Call claudeService.moderatePost
    const modResult = await claudeService.moderatePost(title, content);

    // 2. If inappropriate, reject
    if (!modResult.isAppropriate) {
        return res.status(400).json({ error: 'Post rejected', reason: modResult.reason });
    }

    // 3. Save to MongoDB
    const newPost = await Post.create({
      author: req.user._id,
      city,
      title,
      content,
      category,
      location,
      isModerated: true,
      upvotes: []
    });

    await newPost.populate('author', 'name');

    // 4. Emit socket event
    const io = socketModule.getIo();
    const roomName = city.toLowerCase().replace(/\s+/g, '_');
    io.to(roomName).emit('new_post', newPost);

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/posts/:id/upvote - toggle upvote (Protected)
router.put('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user.id;
    const index = post.upvotes.indexOf(userId);

    // Toggle logic
    if (index === -1) {
        post.upvotes.push(userId); // Add
    } else {
        post.upvotes.splice(index, 1); // Remove
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle upvote' });
  }
});

module.exports = router;
