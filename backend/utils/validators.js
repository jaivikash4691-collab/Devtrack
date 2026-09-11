const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'manager', 'admin'])
    .withMessage('Invalid role specified'),
  validate,
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const projectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .isIn(['Hackathon', 'Capstone', 'Open Source', 'Startup', 'Coursework', 'General'])
    .withMessage('Invalid project category'),
  body('deadline')
    .notEmpty()
    .withMessage('Project deadline is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO date for the deadline'),
  body('technologies')
    .optional()
    .isArray()
    .withMessage('Technologies must be an array of strings'),
  body('githubUrl')
    .optional()
    .trim(),
  validate,
];

const taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 150 })
    .withMessage('Task title cannot exceed 150 characters'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'])
    .withMessage('Invalid task status'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid task priority'),
  body('deadline')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid deadline date format'),
  validate,
];

const milestoneValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Milestone name is required')
    .isLength({ max: 120 })
    .withMessage('Milestone name cannot exceed 120 characters'),
  body('deadline')
    .notEmpty()
    .withMessage('Milestone deadline is required')
    .isISO8601()
    .withMessage('Invalid deadline date format'),
  body('status')
    .optional()
    .isIn(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'])
    .withMessage('Invalid milestone status'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  projectValidation,
  taskValidation,
  milestoneValidation,
};
