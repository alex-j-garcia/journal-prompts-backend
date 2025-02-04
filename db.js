const mongoose = require('mongoose');
const config = require('./utils/config');

let isConnected = false;

mongoose.set('strictQuery', false);

const connectDB = async () => {
  if (!isConnected) {
    await mongoose.connect(config.MONGODB_URI);
    isConnected = true;
  }
};

const closeDB = async () => {
  if (isConnected) {
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.dropDatabase(); // Clean up test data
    }
    
    await mongoose.connection.close();
    isConnected = false;
  }
};

module.exports = {
  connectDB,
  closeDB,
};
