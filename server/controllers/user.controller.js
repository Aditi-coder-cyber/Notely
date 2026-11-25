const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) {
      updates.name = req.body.name.trim();
    }
    if (req.body.avatarUrl !== undefined) {
      updates.avatarUrl = req.body.avatarUrl.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return next(
        ApiError.badRequest('Current password is incorrect', [
          { field: 'currentPassword', message: 'Current password is incorrect' }
        ], 'INVALID_CURRENT_PASSWORD')
      );
    }

    const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const token = jwt.sign(
      { sub: user._id.toString(), tokenVersion: user.tokenVersion },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.status(200).json({
      success: true,
      data: {
        token
      },
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  changePassword
};
