import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import { connectDB, closeDB } from '../db.js';

const api = supertest(app);

const setupTestDB = async () => {
  await connectDB();
  // Ensure a fresh start
  await mongoose.connection.db.dropDatabase();
};

const teardownTestDB = async () => {
  await closeDB();
};

export default {
  api,
  setupTestDB,
  teardownTestDB,
};
