const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  submitTestimonial,
  getSpaceTestimonials,
  moderateTestimonial,
  deleteTestimonial,
  getWallOfLove,
  getSpaceStats,
} = require('../controllers/testimonialController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Prevent abuse of the open public submission endpoint.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions from this device. Please try again later.' },
});

// Public
router.post('/collect/:slug', submitLimiter, upload.single('avatar'), submitTestimonial);
router.get('/wall/:slug', getWallOfLove);

// Owner-only
router.get('/space/:spaceId', protect, getSpaceTestimonials);
router.get('/space/:spaceId/stats', protect, getSpaceStats);
router.patch('/:id/moderate', protect, moderateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

module.exports = router;
