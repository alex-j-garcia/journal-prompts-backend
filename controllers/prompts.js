const promptsRouter = require('express').Router();
const Prompt = require('../models/prompt');
const User = require('../models/user');

promptsRouter.get('/', async (request, response, next) => {
  try {
    const { user: userID } = request.headers;
    const activePrompt = await Prompt.findOne({ activePrompt: true });
    const user = await User.findById(userID);

    if (!user) {
      return response.status(200).json({ 
        ...activePrompt.toJSON(),
        answers: []
      });
    }
  
  // if there is a user
    // determine if the answers have an entry that matches the current prompt ID && the users's ID
    // if there isn't an entry
      // return the current prompt and an empty answers []
    // if there is
      // return the current prompt and all the answers
    response.json(activePrompt);
  } catch(exception) {
    next(exception);
  }
});

module.exports = promptsRouter;
