const Prompt = require('../models/prompt');
const Answer = require('../models/answer');
const User = require('../models/user');
const { faker } = require('@faker-js/faker');

const setActivePrompt = (prompts) => {
  const index = Math.floor(Math.random() * prompts.length);
  const activePrompt = prompts[index];
  return prompts.map((prompt) => (
    prompt.content === activePrompt.content 
      ? { ...prompt, activePrompt: true }
      : prompt
  ));
};

const generateTestPrompts = (length = 2) => {
  const testData = [];
  testData.length = length;
  
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

const getAnswerPayload = (wordCount = 100) => {
  return {
    answer: faker.lorem.words(wordCount),
  };
}

const generateTestAnswers = (length = 2, wordCount = 100) => {
  const testData = [];
  testData.length = length;
  
  for (let i = 0; i < testData.length; i++) {
    testData[i] = getAnswerPayload();
  }

  return testData;
};

const getPromptsInDb = async () => {
  const documents = await Prompt.find({});
  return documents.map((prompt) => prompt.toJSON());
};

const getAnswersInDb = async () => {
  const documents = await Answer.find({});
  return documents.map((answer) => answer.toJSON());
};

const getUsersInDb = async () => {
  const documents = await User.find({});
  return documents.map((user) => user.toJSON());
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
  prompts: {
    initialPrompts: generateTestPrompts(),
    getPromptsInDb,
  },
  answers: {
    initialAnswers: generateTestAnswers(),
    getAnswersInDb,
    getAnswerPayload,
  },
  users: {
    getUsersInDb,
  },
  misc: {
    malformedID: getMalformedID(),
    getNonexistingID,
  }
};
