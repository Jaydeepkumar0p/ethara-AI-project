const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    next(error);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const projectMember = (roles = ['admin', 'member']) => async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.projectId || req.body.project;
    
    if (!projectId) return next();
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      m => m.user.toString() === req.user._id.toString()
    );
    
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isGlobalAdmin = req.user.role === 'admin';

    if (!member && !isOwner && !isGlobalAdmin) {
      return res.status(403).json({ message: 'Not a project member' });
    }

    const memberRole = isOwner ? 'admin' : (member?.role || 'member');
    if (!roles.includes(memberRole) && !isGlobalAdmin) {
      return res.status(403).json({ message: 'Insufficient project permissions' });
    }

    req.project = project;
    req.memberRole = memberRole;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, adminOnly, projectMember };
