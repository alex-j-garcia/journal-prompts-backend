const router = require('express').Router();
const Prompt = require('../models/prompt')

router.get('/', async (request, response) => {
  const prompts = await Prompt.find({});
  return response.json(prompts);
});

module.exports = router;
