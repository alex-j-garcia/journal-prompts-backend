const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGODB_URI).then((promise) => {
  console.log('Successfully connected to MongoDB');
})
.catch((error) => {
  console.log(`An error occurred: ${error.message}`);
});

const promptSchema = new mongoose.Schema({
  content: String,
  tag: String,
  date: Date,
});

const Prompt = mongoose.model('Prompt', promptSchema);

const prompts = [
  {
    "content": "In 5 years' time, what would your ideal life look like? What would the worst version look like?  (TODAY)",
    "tag": "goals",
    "date": new Date(),
  },
  {
    "content": "Who are you most grateful for and why?",
    "tag": "relationships",
    "date": new Date(),
  },
  {
    "content": "Is there a difficult conversation you're avoiding? If so, why?",
    "tag": "relationships",
    "date": new Date(),
  },
];

const promptsPromises = prompts.map((p) => {
  const prompt = new Prompt(p);
  return prompt.save();
});

Promise.all(promptsPromises).then((promise) => {
  console.log('asynchronous code completed, all items should be saved');
  mongoose.connection.close();
});

console.log('Synchronous code completed, waiting for saving...')
