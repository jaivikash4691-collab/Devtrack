const mongoose = require('mongoose');
let mongoServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      try {
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.warn(`[MongoDB] Could not connect to MONGODB_URI (${mongoUri}): ${err.message}`);
        if (process.env.NODE_ENV === 'production') {
          throw err;
        }
        console.log('[MongoDB] Falling back to in-memory database for seamless local execution...');
      }
    }

    // In-memory fallback for local development & testing
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected to in-memory database: ${uri}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error(`[MongoDB] Error disconnecting: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
