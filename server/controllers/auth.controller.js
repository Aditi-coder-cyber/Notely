const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const register = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const email = req.body.email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        ApiError.conflict('An account with this email already exists', [
          { field: 'email', message: 'Email is already registered' }
        ])
      );
    }

    const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email,
      passwordHash,
      avatarUrl: req.body.avatarUrl || ''
    });

    const token = jwt.sign(
      { sub: user._id.toString(), tokenVersion: user.tokenVersion },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = req.body.email.toLowerCase().trim();

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password', [], 'INVALID_CREDENTIALS'));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password', [], 'INVALID_CREDENTIALS'));
    }

    const token = jwt.sign(
      { sub: user._id.toString(), tokenVersion: user.tokenVersion },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

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
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
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
      message: 'User retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
