const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users - Search users (for adding to projects)
router.get('/', protect, async (req, res, next) => {
  try {
    const { search, limit = 10 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('name email avatar role').limit(parseInt(limit));
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name email avatar role createdAt lastLogin');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// GET /api/users (admin) - All users
router.get('/admin/all', protect, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
