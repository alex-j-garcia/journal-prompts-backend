const answersRouter = require('express').Router();
const User = require('../models/user')
const Answer = require('../models/answer');

answersRouter.get('/', async (request, response, next) => {
  try {
    const answers = await Answer
    .find({})
    .populate('user', { username: 1 });

    response.json(answers);
  } catch (exception) {
    next(exception);
  }
});

answersRouter.post('/', async (request, response, next) => {
  try {
    if (!request.body.user) {
      const anonUser = new User({ username: 'anonymous' });
      const savedAnonUser = await anonUser.save();
      request.body.user = savedAnonUser._id.toString();
    }

    const answerDoc = new Answer({
      answer: request.body.answer,
      promptId: request.body.promptId,
      user: request.body.user,
    });

    const savedAnswer = await answerDoc.save();
    response.status(201).json(savedAnswer);
  } catch (exception) {
    next(exception);
  }
});

module.exports = answersRouter;
