const router = require('express').Router();
const Answer = require('../models/answer');

router.get('/', async (request, response, next) => {
  try {
    const answers = await Answer.find({}); 
    response.json(answers);
  } catch (exception) {
    next(exception);
  }
});

module.exports = {};
