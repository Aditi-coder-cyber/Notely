const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Authentication token missing or invalid', 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new ApiError(401, 'Authentication token missing', 'UNAUTHORIZED'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Authentication token has expired', 'TOKEN_EXPIRED'));
      }
      return next(new ApiError(401, 'Invalid authentication token', 'INVALID_TOKEN'));
    }

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return next(new ApiError(401, 'Invalid token payload', 'INVALID_TOKEN'));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError(401, 'User no longer exists', 'USER_NOT_FOUND'));
    }

    // Check tokenVersion for invalidation (e.g. after password change)
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return next(new ApiError(401, 'Token has been invalidated', 'TOKEN_INVALIDATED'));
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      tokenVersion: user.tokenVersion
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
