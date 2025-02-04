const promptsRouter = require('express').Router();
const Prompt = require('../models/prompt');
const User = require('../models/user');
const Answer = require('../models/answer');

const getUser = (request, response, next) => {
  const { user } = request.headers;
  request.body.user = user;
  next();
};

promptsRouter.use(getUser);

promptsRouter.get('/', async (request, response, next) => {
  try {
    const activePrompt = await Prompt.findOne({ activePrompt: true });
    
    const answer = await Answer.findOne({
      user: request.body.user,
      promptId: activePrompt._id
    });
 
    if (!answer) {
      return response.status(200).json({ 
        ...activePrompt.toJSON(),
        answers: []
      });
    }

    const answers = await Answer.find({});
    response.json({ ...activePrompt.toJSON(), answers, });
  } catch(exception) {
    next(exception);
  }
});

module.exports = promptsRouter;
