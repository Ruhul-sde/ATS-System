import mongoose from 'mongoose';
import { config } from './environment.js';

const connectDB = async () => {
  try {
    const mongoUri = config.database.mongoUri || 'mongodb://localhost:27017/ats_pro';
    console.log('Attempting to connect to MongoDB:', mongoUri);

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Continuing without database connection...');
    // Don't exit the process, allow server to start without DB for now
  }
};

export default connectDB;