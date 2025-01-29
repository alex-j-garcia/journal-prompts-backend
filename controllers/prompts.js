const promptsRouter = require('express').Router();
const Prompt = require('../models/prompt');

promptsRouter.get('/', async (request, response, next) => {
  try {
    const activePrompt = await Prompt.findOne({ activePrompt: true });
    response.json(activePrompt);
  } catch(exception) {
    next(exception);
  }
});

module.exports = promptsRouter;
