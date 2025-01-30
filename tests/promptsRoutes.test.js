const { 
  it,
  describe,
  beforeEach,
  after,
} = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Prompt = require('../models/prompt');
const User = require('../models/user');
const helper = require('./tests-helper');
const endpoints = require('./endpoints');

const api = supertest(app);

describe('/api/prompts', {only: true}, () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Prompt.deleteMany({});

    const promptsToSave = helper
      .prompts
      .initialPrompts
      .map((prompt) => new Prompt(prompt));
    const promptPromises = promptsToSave.map((prompt) => prompt.save());

    await Promise.all(promptPromises);
  });

  it('should return prompt in JSON format', async () => {
    await api
      .get(endpoints.allPrompts)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('should return one prompt', async () => {
    const response = await api
      .get(endpoints.allPrompts)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert(!response.body.length);
  });

  it('should return the active prompt', async () => {
    const promptsInDb = await helper.prompts.getPromptsInDb();
    const activePrompt = promptsInDb.find((prompt) => prompt.activePrompt);

    const response = await api
      .get(endpoints.allPrompts)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert(response.body.id, activePrompt.id);
  });

  it('should not return answers if the user does not exist', async () => {
    const response = await api
      .get(endpoints.allPrompts)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert(response.body.answers.length === 0);
  });
});

after(async () => {
  await mongoose.connection.close();
});
