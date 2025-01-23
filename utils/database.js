const mongoose = require('mongoose');
const dayjs = require('dayjs');
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

const setDailyPrompt = async () => {
  const date = dayjs().date();
  const prompt = prompts[date - 1];

  try {
    const activePrompt = await Prompt.findOne({ activePrompt: true });
    await Prompt.findByIdAndUpdate(activePrompt.id, { activePrompt: false });

    const dailyPrompt = await Prompt.findOne( { content: prompt.content } );
    const newActivePrompt = await Prompt.findByIdAndUpdate(dailyPrompt.id, { activePrompt: true });
    console.log(`Daily prompt set to: ${JSON.stringify(newActivePrompt)}`);
  } catch (exception) {
    console.error(`There was an error: ${exception}`);
  } finally {
    await mongoose.connection.close();
    console.log('Connection to MongoDB closed');
  }
};

const main = async () => {
  if (process.argv[2] === 'reset') {
    await setDatabasePrompts();
    console.log('Database reset to default. There is no active prompt');
  } else {
    console.log('Setting the daily prompt...')
    await setDailyPrompt();
  }
}

main()
