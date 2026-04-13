require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');

// Routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const weatherRoutes = require('./routes/weather');
const jobsRoutes = require('./routes/jobs');
const briefRoutes = require('./routes/brief');
const postsRoutes = require('./routes/posts');
const analyticsRoutes = require('./routes/analytics');

// Services / Utilities
const socketModule = require('./socket');
const cronModule = require('./cron');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketModule.init(server);

// Initialize Cron Jobs
cronModule.initCron();

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/brief', briefRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

// Temporarily using localhost mongodb if MONGODB_URI is not set just so it doesn't crash entirely if tested, 
// but it will try to connect. 
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/localpulse')
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Still start server even if DB fails for testing purposes if MONGODB_URI is empty
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (without MongoDB)`);
    });
  });
