const promptsRouter = require('express').Router();
const Prompt = require('../models/prompt');
const Answer = require('../models/answer');

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

    const answers = await Answer
      .find({
        promptId: activePrompt._id.toString(),
      })
      .populate('user', { username: 1 });
    
    response.json({ ...activePrompt.toJSON(), answers, });
  } catch(exception) {
    next(exception);
  }
});

module.exports = promptsRouter;
