import express from 'express';
import usersRouter from './controllers/users.js';
import answersRouter from './controllers/answers.js';
import promptsRouter from './controllers/prompts.js';
import loginRouter from './controllers/login.js';
import middleware from './utils/middleware.js';

const app = express();

app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.getUserIdFromToken);
app.use(middleware.requestLogger);

app.use('/api/prompts', promptsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
