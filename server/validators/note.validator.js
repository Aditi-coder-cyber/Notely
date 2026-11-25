const { body, query, param, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const ALLOWED_COLORS = ['default', 'yellow', 'blue', 'green', 'pink', 'purple'];
const ALLOWED_SORT_FIELDS = ['updatedAt', 'createdAt'];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details));
  }
  next();
};

const noteIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid note ID format'),
  handleValidation
];

const createNoteValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 160 })
    .withMessage('Title must be between 1 and 160 characters'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string')
    .isLength({ max: 100000 })
    .withMessage('Content cannot exceed 100,000 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array of at most 10 items')
    .custom((tags) => {
      if (!tags.every((tag) => typeof tag === 'string' && tag.trim().length <= 30)) {
        throw new Error('Each tag must be a string up to 30 characters');
      }
      return true;
    }),
  body('color')
    .optional()
    .isIn(ALLOWED_COLORS)
    .withMessage(`Color must be one of: ${ALLOWED_COLORS.join(', ')}`),
  handleValidation
];

const updateNoteValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 160 })
    .withMessage('Title must be between 1 and 160 characters'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string')
    .isLength({ max: 100000 })
    .withMessage('Content cannot exceed 100,000 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array of at most 10 items')
    .custom((tags) => {
      if (!tags.every((tag) => typeof tag === 'string' && tag.trim().length <= 30)) {
        throw new Error('Each tag must be a string up to 30 characters');
      }
      return true;
    }),
  body('color')
    .optional()
    .isIn(ALLOWED_COLORS)
    .withMessage(`Color must be one of: ${ALLOWED_COLORS.join(', ')}`),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean'),
  handleValidation
];

const listNotesQueryValidator = [
  query('search')
    .optional()
    .isString()
    .trim()
    .withMessage('Search query must be a string'),
  query('tag')
    .optional()
    .isString()
    .trim()
    .withMessage('Tag must be a string'),
  query('color')
    .optional()
    .isIn(ALLOWED_COLORS)
    .withMessage(`Color must be one of: ${ALLOWED_COLORS.join(', ')}`),
  query('archived')
    .optional()
    .isBoolean()
    .withMessage('Archived must be a boolean (true/false)'),
  query('deleted')
    .optional()
    .isBoolean()
    .withMessage('Deleted must be a boolean (true/false)'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50'),
  query('sort')
    .optional()
    .isIn(ALLOWED_SORT_FIELDS)
    .withMessage(`Sort must be one of: ${ALLOWED_SORT_FIELDS.join(', ')}`),
  handleValidation
];

module.exports = {
  noteIdValidator,
  createNoteValidator,
  updateNoteValidator,
  listNotesQueryValidator,
  ALLOWED_COLORS,
  ALLOWED_SORT_FIELDS
};
