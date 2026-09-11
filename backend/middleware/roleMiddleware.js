const Project = require('../models/Project');

// Global System Admin check
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. System administrator privileges required.',
  });
};

// Project Access Check (Owner, Member, Viewer, or Admin)
const requireProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // System admin has universal access
    if (req.user.role === 'admin') {
      req.project = project;
      req.projectRole = 'manager';
      return next();
    }

    // Check if user is owner
    if (project.owner.toString() === req.user._id.toString()) {
      req.project = project;
      req.projectRole = 'manager';
      return next();
    }

    // Check if user is in members list
    const memberRecord = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (memberRecord) {
      req.project = project;
      req.projectRole = memberRecord.role;
      return next();
    }

    // If project is public, allow read-only viewer access
    if (project.visibility === 'public' && req.method === 'GET') {
      req.project = project;
      req.projectRole = 'viewer';
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not a member of this project.',
    });
  } catch (error) {
    next(error);
  }
};

// Project Manager Check (Owner, Project Role 'manager', or Admin)
const requireProjectManager = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // System admin has universal manager rights
    if (req.user.role === 'admin') {
      req.project = project;
      req.projectRole = 'manager';
      return next();
    }

    // Check if owner
    if (project.owner.toString() === req.user._id.toString()) {
      req.project = project;
      req.projectRole = 'manager';
      return next();
    }

    // Check if member with manager role
    const memberRecord = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (memberRecord && memberRecord.role === 'manager') {
      req.project = project;
      req.projectRole = 'manager';
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. Project Manager privileges required for this action.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireAdmin,
  requireProjectAccess,
  requireProjectManager,
};
