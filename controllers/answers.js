import express from 'express';
import User from '../models/user.js';
import Answer from '../models/answer.js';
import { faker } from '@faker-js/faker';
import { Filter } from 'bad-words';

const answersRouter = express.Router();

const getAnonUser = () => {
  const animal = faker.animal.type();
  const number = faker.string.numeric(7);
  return `anonymous ${animal} ${number}`;
};

answersRouter.get('/', async (request, response, next) => {
  const promptId = request.query.promptId;

  try {
    const answers = await Answer
      .find({ promptId })
      .populate('user', { username: 1 });

    response.json(answers);
  } catch (exception) {
    next(exception);
  }
});

answersRouter.post('/', async (request, response, next) => {
  const badWordsFilter = new Filter();
  const cleanAnswer = badWordsFilter.clean(request.body.answer);

  try {
    if (!request.body.user) {
      const anonUser = new User({ username: getAnonUser() });
      const savedAnonUser = await anonUser.save();
      request.body.user = savedAnonUser._id.toString();
    }

    const answerDoc = new Answer({
      answer: cleanAnswer,
      promptId: request.body.promptId,
      user: request.body.user,
    });

    const savedAnswer = await answerDoc.save();
    const answerWithUsername = await savedAnswer.populate('user');
    response.status(201).json(answerWithUsername);
  } catch (exception) {
    next(exception);
  }
});

export default answersRouter;
