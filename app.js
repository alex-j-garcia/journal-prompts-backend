const config = require('./utils/config');
const express = require('express');
const app = express();
const answersRouter = require('./controllers/answers');
const promptsRouter = require('./controllers/prompts');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

logger.info(`connecting to ${config.MONGODB_URI}`);

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('successsfully connected to MongoDB')
  })
  .catch((error) => {
    logger.info(`a MongoDB connection error occurred: ${error}`);
  });

app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/prompts', promptsRouter);
app.use('/api/answers', answersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
