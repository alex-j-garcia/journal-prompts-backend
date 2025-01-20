const { 
  test,
  describe,
  beforeEach,
  after,
} = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Prompt = require('../models/prompt');
const helper = require('./tests-helper');

const api = supertest(app);

describe('/api/prompts', () => {
  beforeEach(async () => {
    await Prompt.deleteMany({});
    const promptsToSave = helper.initialPrompts.map((prompt) => new Prompt(prompt));
    const promptPromises = promptsToSave.map((prompt) => prompt.save());
    await Promise.all(promptPromises);
  });

  test('it should return prompts in JSON format', async () => {
    await api.get('/api/prompts')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('it should return all prompts', async () => {
    const response = await api.get('/api/prompts');
    assert(response.body.length === helper.initialPrompts.length);
  });

  test('it should return the expected prompts', async () => {
    const promptsInDb = helper.initialPrompts;
    const response = await api.get('/api/prompts')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const promptContent = response.body.map((prompt) => prompt.content);

    assert(promptContent.includes(promptsInDb[0].content));
  });

  test('it should return an individual prompt', async () => {
    const promptsInDb = await helper.getPromptsInDb();
    const target = promptsInDb[0];

    const response = await api.get(`/api/prompts/${target.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    
    assert.deepStrictEqual(response.body, target);
  });

  test('it should return 404 if a prompt does not exist', async () => {
    const id = await helper.getNonexistingID();
    await api.get(`/api/prompts/${id}`)
      .expect(404);
  });

  test('it should not return 400 if the ID is malformed', async () => {
    const malformedId = helper.malformedID;
    const response = await api.get(`/api/prompts/${malformedId}`)
      .expect(400);

    assert(response.body.error.includes('malformed ID'));
  });
});

after(async () => {
  await mongoose.connection.close();
});
