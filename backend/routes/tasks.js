const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

// Helper: check project access
const checkProjectAccess = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };
  const isMember = project.members.some(m => m.user.toString() === userId.toString());
  const isOwner = project.owner.toString() === userId.toString();
  if (!isMember && !isOwner && userRole !== 'admin') {
    return { error: 'Not a project member', status: 403 };
  }
  return { project };
};

// GET /api/tasks - Get tasks (with filters)
router.get('/', protect, async (req, res, next) => {
  try {
    const { project, status, priority, assignee, overdue, page = 1, limit = 50 } = req.query;
    const query = {};

    if (project) {
      const access = await checkProjectAccess(project, req.user._id, req.user.role);
      if (access.error) return res.status(access.status).json({ message: access.error });
      query.project = project;
    } else {
      // Get all tasks across user's projects
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
      }).select('_id');
      query.project = { $in: userProjects.map(p => p._id) };
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee === 'me') query.assignee = req.user._id;
    else if (assignee) query.assignee = assignee;
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'done' };
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color')
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);
    res.json({ tasks, total });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks
router.post('/', protect, [
  body('title').trim().isLength({ min: 2, max: 200 }),
  body('project').isMongoId().withMessage('Valid project ID required'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('dueDate').optional().isISO8601(),
  body('assignee').optional().isMongoId()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const access = await checkProjectAccess(req.body.project, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('project', 'name color');

    // Send notification if assigned to someone else
    if (task.assignee && task.assignee._id.toString() !== req.user._id.toString()) {
      const assigneeUser = await User.findById(task.assignee._id);
      if (assigneeUser?.notificationPreferences?.taskAssigned) {
        sendEmail(
          assigneeUser.email, 'taskAssigned',
          assigneeUser.name, task.title,
          access.project.name, req.user.name, task.dueDate
        );
      }
    }

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color members owner')
      .populate('comments.user', 'name email avatar');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const access = await checkProjectAccess(task.project._id, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    res.json({ task });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const access = await checkProjectAccess(task.project._id, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    const oldStatus = task.status;
    const oldAssignee = task.assignee?.toString();

    const allowed = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'tags', 'estimatedHours', 'actualHours', 'order'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('project', 'name color');

    // Notify on status change
    if (oldStatus !== task.status && task.assignee) {
      const assigneeUser = await User.findById(task.assignee._id);
      if (assigneeUser?.notificationPreferences?.taskUpdated) {
        sendEmail(assigneeUser.email, 'taskUpdated', assigneeUser.name, task.title, oldStatus, task.status);
      }
    }

    // Notify new assignee
    if (task.assignee && task.assignee._id.toString() !== oldAssignee &&
        task.assignee._id.toString() !== req.user._id.toString()) {
      const assigneeUser = await User.findById(task.assignee._id);
      if (assigneeUser?.notificationPreferences?.taskAssigned) {
        sendEmail(
          assigneeUser.email, 'taskAssigned',
          assigneeUser.name, task.title,
          task.project.name, req.user.name, task.dueDate
        );
      }
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const access = await checkProjectAccess(task.project, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignee?.toString() === req.user._id.toString();
    if (!isCreator && !isAssignee && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks/:id/comments
router.post('/:id/comments', protect, [
  body('text').trim().isLength({ min: 1, max: 1000 })
], async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const access = await checkProjectAccess(task.project, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    task.comments.push({ user: req.user._id, text: req.body.text });
    await task.save();
    await task.populate('comments.user', 'name email avatar');

    res.json({ comments: task.comments });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/dashboard/stats
router.get('/dashboard/stats', protect, async (req, res, next) => {
  try {
    const userProjects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [myTasks, allTaskStatus, overdueTasks, completedThisWeek, projectCount] = await Promise.all([
      Task.countDocuments({ assignee: req.user._id, status: { $ne: 'done' }, project: { $in: projectIds } }),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({ project: { $in: projectIds }, dueDate: { $lt: now }, status: { $ne: 'done' } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done', completedAt: { $gte: sevenDaysAgo } }),
      Project.countDocuments({ $or: [{ owner: req.user._id }, { 'members.user': req.user._id }] })
    ]);

    const statusMap = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    allTaskStatus.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      myTasks,
      overdueTasks,
      completedThisWeek,
      projectCount,
      tasksByStatus: statusMap,
      totalTasks: Object.values(statusMap).reduce((a, b) => a + b, 0)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
