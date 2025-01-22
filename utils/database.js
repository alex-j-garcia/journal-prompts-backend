const mongoose = require('mongoose');
const Prompt = require('../models/prompt');
const prompts = require('./prompts.json');

require('dotenv').config();

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGODB_URI).then((promise) => {
  console.log('Successfully connected to MongoDB');
})
.catch((error) => {
  console.log(`An error occurred: ${error.message}`);
});

const setDatabasePrompts = async () => {
  await Prompt.deleteMany({});

  const promptPromises = prompts.map((p) => {
    const prompt = new Prompt({ ...p, activePrompt: false, answers: [] });
    return prompt.save();
  });

  await Promise.all(promptPromises);
  console.log('Database reset and new prompts saved');

  await mongoose.connection.close();
  console.log('Connection to MongoDB closed');
};

setDatabasePrompts();
