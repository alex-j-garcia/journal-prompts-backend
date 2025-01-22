const mongoose = require('mongoose');
const Prompt = require('../models/prompt');
require('dotenv').config();

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGODB_URI).then((promise) => {
  console.log('Successfully connected to MongoDB');
})
.catch((error) => {
  console.log(`An error occurred: ${error.message}`);
});

const prompts = [
  {
    "content": "In 5 years' time, what would your ideal life look like? What would the worst version look like?",
    "tag": "goals",
  },
  {
    "content": "Who are you most grateful for and why?",
    "tag": "relationships",
  },
  {
    "content": "Is there a difficult conversation you're avoiding? If so, why?",
    "tag": "relationships",
  },
  {
    "content": "What favorite childhood activity do you no longer engage in?",
    "tag": "personality",
  },
  {
    "content": "If money wasn't an obstacle, what would you do for work?",
    "tag": "personality",
  },
  {
    "content": "What makes you excited to get out of bed in the morning",
    "tag": "goals",
  },
  {
    "content": "Is there a habit that's holding you back from reaching your full potential?",
    "tag": "personality",
  },
  {
    "content": "What could you do to make today just 1% better than yesterday?",
    "tag": "goals",
  },
  {
    "content": "What's a piece of advice you would give to your younger self?",
    "tag": "personality",
  },
  {
    "content": "What would you like to be remembered for when you're gone?",
    "tag": "goals",
  },
];

const promptsPromises = prompts.map((p) => {
  const prompt = new Prompt({ ...p, activePrompt: false, answers: [] });
  return prompt.save();
});

Promise.all(promptsPromises).then((promise) => {
  console.log('asynchronous code completed, all items should be saved');
  mongoose.connection.close();
});

console.log('Synchronous code completed, waiting for saving...')
