import mongoose from 'mongoose';
import config from './utils/config.js';

let isConnected = false;

mongoose.set('strictQuery', false);

export const connectDB = async () => {
  if (!isConnected) {
    await mongoose.connect(config.MONGODB_URI);
    isConnected = true;
  }
};

export const closeDB = async () => {
  if (isConnected) {
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.dropDatabase(); // Clean up test data
    }
    
    await mongoose.connection.close();
    isConnected = false;
  }
};
