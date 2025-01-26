const Prompt = require('../models/prompt');
const { faker } = require('@faker-js/faker');

const setActivePrompt = (prompts) => {
  const index = Math.floor(Math.random() * prompts.length);
  const activePrompt = prompts[index];
  return prompts.map((prompt) => {
    return prompt.content === activePrompt.content 
      ? { ...prompt, activePrompt: true }
      : prompt;
  });
};

const generateTestData = (length = 0) => {
  const testData = [];
  testData.length = length 
    ? length
    : Math.ceil(Math.random() * 5);
  
  for (let i = 0; i < testData.length; i++) {
    testData[i] = {
      content: faker.lorem.sentence(),
      activePrompt: false,
      answers: [],
      tag: faker.lorem.word(),
    };
  }

  return setActivePrompt(testData);
};

const getPromptsInDb = async () => {
  const documents = await Prompt.find({});
  const prompts = documents.map((prompt) => prompt.toJSON());
  return prompts;
};

const getNonexistingID = async () => {
  const prompt = new Prompt({ content: faker.lorem.sentence() });
  await prompt.save();
  await prompt.deleteOne();
  return prompt._id.toString();
};

const getMalformedID = () => {
  return faker.number.romanNumeral();
};

module.exports = {
  initialPrompts: generateTestData(2),
  malformedID: getMalformedID(),
  getPromptsInDb,
  getNonexistingID,
};
