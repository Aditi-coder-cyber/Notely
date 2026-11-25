const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async (customUri) => {
  const uri = customUri || config.mongoUri;
  if (!uri) {
    throw new Error('FATAL: MongoDB URI is missing.');
  }

  try {
    const conn = await mongoose.connect(uri);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connectDB,
  disconnectDB
};
