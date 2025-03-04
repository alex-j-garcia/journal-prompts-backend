const express = require('express');
const app = express();
const usersRouter = require('./controllers/users');
const answersRouter = require('./controllers/answers');
const promptsRouter = require('./controllers/prompts');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');

app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.getTokenFromRequest);
app.use(middleware.requestLogger);

app.use('/api/prompts', promptsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
