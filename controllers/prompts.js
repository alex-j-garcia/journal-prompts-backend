const router = require('express').Router();
const Prompt = require('../models/prompt');

router.get('/', async (request, response, next) => {
  const isActive = request.query.active;
  let query = {};

  if (isActive === 'true') {
    query = { ...query, activePrompt: true };
  } else if (isActive === 'false') {
    query = { ...query, activePrompt: false };
  }

  try {
    const promptOrPrompts = await Prompt.find(query);
    response.json(promptOrPrompts);
  } catch(exception) {
    next(exception);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const prompt = await Prompt.findById(request.params.id);

    if (prompt) {
      return response.json(prompt);
    }

    response.status(404).end();
  } catch(exception) {
    next(exception);
  }
});

module.exports = router;
