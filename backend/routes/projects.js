const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, projectMember } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

// GET /api/projects - Get user's projects
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    };
    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Add task counts
    const projectsWithCounts = await Promise.all(projects.map(async (p) => {
      const taskCounts = await Task.aggregate([
        { $match: { project: p._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      const counts = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
      taskCounts.forEach(t => { counts[t._id] = t.count; });
      return { ...p.toJSON(), taskCounts: counts };
    }));

    const total = await Project.countDocuments(query);
    res.json({ projects: projectsWithCounts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects
router.post('/', protect, [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['active', 'completed', 'on-hold', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('deadline').optional().isISO8601(),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/)
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const project = await Project.create({ ...req.body, owner: req.user._id });
    await project.populate('owner', 'name email avatar');
    
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    if (!isMember && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const taskCounts = await Task.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const counts = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    taskCounts.forEach(t => { counts[t._id] = t.count; });

    res.json({ project: { ...project.toJSON(), taskCounts: counts } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/projects/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    
    if (!isOwner && member?.role !== 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can update' });
    }

    const allowed = ['name', 'description', 'status', 'priority', 'deadline', 'color', 'tags'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json({ project });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects/:id/members - Add member
router.post('/:id/members', protect, async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project owner can add members' });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with that email' });

    const alreadyMember = project.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: userToAdd._id, role });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    // Send invitation email
    sendEmail(userToAdd.email, 'projectInvite', userToAdd.name, project.name, req.user.name);

    res.json({ project });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project owner can remove members' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    res.json({ message: 'Member removed', project });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project owner can delete' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project and all its tasks deleted' });
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id/stats
router.get('/:id/stats', protect, async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const now = new Date();

    const [tasksByStatus, tasksByPriority, overdueTasks, recentActivity] = await Promise.all([
      Task.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId) } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({ project: projectId, dueDate: { $lt: now }, status: { $ne: 'done' } }),
      Task.find({ project: projectId }).sort({ updatedAt: -1 }).limit(5).populate('assignee', 'name avatar')
    ]);

    res.json({ tasksByStatus, tasksByPriority, overdueTasks, recentActivity });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
