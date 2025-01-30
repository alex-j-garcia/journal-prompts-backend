const { 
  it,
  describe,
  beforeEach,
  after,
} = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Prompt = require('../models/prompt');
const helper = require('./tests-helper');
const endpoints = require('./endpoints');

const api = supertest(app);

describe('/api/prompts', () => {
  beforeEach(async () => {
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

    assert.deepStrictEqual(response.body, activePrompt);
  });
});

after(async () => {
  await mongoose.connection.close();
});
