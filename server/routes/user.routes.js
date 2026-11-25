const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');
const {
  updateProfileValidator,
  changePasswordValidator
} = require('../validators/user.validator');

// All user routes require authentication
router.use(authMiddleware);

router.put('/me', updateProfileValidator, userController.updateProfile);
router.put('/me/password', changePasswordValidator, userController.changePassword);

module.exports = router;
