const config = require('./utils/config');
const logger = require('./utils/logger');
const express = require('express');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');
const promptsRouter = require('./controllers/prompts');
const answersRouter = require('./controllers/answers');

const app = express();
app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use('/api/prompts', promptsRouter);
app.use('/api/answers', answersRouter);
app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);

app.listen(config.PORT, () => {
  console.log(`App listening on port ${config.PORT}`);
})

mongoose.set('strictQuery', false);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('successsfully connected to MongoDB')
  })
  .catch((error) => {
    logger.info(`a MongoDB connection error occurred: ${error}`);
  });

module.exports = app;
