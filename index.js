require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');
const promptsRouter = require('./controllers/prompts');

const app = express();
app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use('/api/prompts', promptsRouter);
app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);

const PORT = process.env.PORT;
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
})

mongoose.set('strictQuery', false);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('successsfully connected to MongoDB')
  })
  .catch((error) => {
    console.log(`a MongoDB connection error occurred: ${error}`);
  });

module.exports = app;
