const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config');

let mongoServer;

const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }
};

const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

const createTestUser = async (overrides = {}) => {
  const password = overrides.password || 'TestPassword123';
  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  const userData = {
    name: overrides.name || 'Test User',
    email: (overrides.email || `test-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`).toLowerCase(),
    passwordHash,
    avatarUrl: overrides.avatarUrl || '',
    tokenVersion: overrides.tokenVersion !== undefined ? overrides.tokenVersion : 0
  };

  const user = await User.create(userData);
  return { user, password };
};

const getAuthToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), tokenVersion: user.tokenVersion || 0 },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

module.exports = {
  connectTestDB,
  closeTestDB,
  clearTestDB,
  createTestUser,
  getAuthToken
};
