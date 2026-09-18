const express = require('express');
const {
  createSpace,
  getMySpaces,
  getSpaceById,
  updateSpace,
  deleteSpace,
  getPublicSpace,
} = require('../controllers/spaceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/public/:slug', getPublicSpace);

// Owner-only
router.post('/', protect, createSpace);
router.get('/', protect, getMySpaces);
router.get('/:id', protect, getSpaceById);
router.patch('/:id', protect, updateSpace);
router.delete('/:id', protect, deleteSpace);

module.exports = router;
