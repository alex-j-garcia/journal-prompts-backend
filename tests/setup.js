const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const { connectDB, closeDB } = require('../db');

const api = supertest(app);

const setupTestDB = async () => {
  await connectDB();
  await mongoose.connection.db.dropDatabase(); // Ensure a fresh start
};

const teardownTestDB = async () => {
  await closeDB();
};

module.exports = {
  api,
  setupTestDB,
  teardownTestDB,
};
