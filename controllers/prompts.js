const router = require('express').Router();
const Prompt = require('../models/prompt')

router.get('/', async (request, response, next) => {
  try {
    const prompts = await Prompt.find({});
    response.json(prompts);
  } catch(exception) {
    next(exception);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const prompt = await Prompt.findById(request.params.id);
    response.json(prompt);
  } catch(exception) {
    next(exception);
  }
});

module.exports = router;
