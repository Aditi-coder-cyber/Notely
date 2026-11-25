const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file if present
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isTest = process.env.NODE_ENV === 'test';

// In test environment, set fallback test JWT secret if not provided
if (isTest && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_key_1234567890_notes_kb';
}

// Fail-fast validation for required environment variables
const missingVars = [];
if (!process.env.JWT_SECRET) {
  missingVars.push('JWT_SECRET');
}
if (!process.env.MONGO_URI && !isTest) {
  missingVars.push('MONGO_URI');
}

if (missingVars.length > 0) {
  throw new Error(`FATAL: Missing required environment variable(s): ${missingVars.join(', ')}`);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || (isTest ? 'mongodb://localhost:27017/test' : ''),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  bcryptSaltRounds: 12
};

module.exports = config;
