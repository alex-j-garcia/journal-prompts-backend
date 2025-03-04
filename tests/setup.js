const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const { connectDB, closeDB } = require('../db');

const api = supertest(app);

const setupTestDB = async () => {
  await connectDB();
  // Ensure a fresh start
  await mongoose.connection.db.dropDatabase();
};

const teardownTestDB = async () => {
  await closeDB();
};

module.exports = {
  api,
  setupTestDB,
  teardownTestDB,
};
