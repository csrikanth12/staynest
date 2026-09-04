const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stayguard';
    
    // Attempt connecting to the configured MONGO_URI with a short timeout
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to primary MongoDB (${error.message}). Falling back to in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ MongoDB Memory Server Connected: ${inMemoryUri}`);
    } catch (memError) {
      console.error(`❌ MongoDB Memory Server connection failed: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
