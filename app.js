const express = require('express');
const app = express();
const answersRouter = require('./controllers/answers');
const promptsRouter = require('./controllers/prompts');
const middleware = require('./utils/middleware');

app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/prompts', promptsRouter);
app.use('/api/answers', answersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
