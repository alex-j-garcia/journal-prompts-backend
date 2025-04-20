import express from 'express';
import Prompt from '../models/prompt.js';
import Answer from '../models/answer.js';

const promptsRouter = express.Router();

promptsRouter.get('/', async (request, response, next) => {
  try {
    const activePrompt = await Prompt.findOne({ activePrompt: true });
    
    const answer = await Answer.findOne({
      user: request.body.user,
      promptId: activePrompt._id,
    });
 
    if (!answer) {
      return response
        .status(200)
        .json({ 
          ...activePrompt.toJSON(),
          answers: [],
        });
    }

    const answers = await Answer
      .find({ promptId: activePrompt._id.toString() })
      .populate('user', { username: 1 });
    
    response
      .status(200)
      .json({
        ...activePrompt.toJSON(),
        answers,
      });
  } catch(exception) {
    next(exception);
  }
});

export default promptsRouter;
