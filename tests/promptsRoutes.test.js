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
const endpoints = require('./endpoints');

const api = supertest(app);

describe('prompts controller', () => {
  beforeEach(async () => {
    await Prompt.deleteMany({});
    const promptsToSave = helper.initialPrompts.map((prompt) => new Prompt(prompt));
    const promptPromises = promptsToSave.map((prompt) => prompt.save());
    await Promise.all(promptPromises);
  });

  describe('/api/prompts', () => {
    test('it should return prompts in JSON format', async () => {
      await api.get(endpoints.allPrompts)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
  
    test('it should return all prompts', async () => {
      const response = await api.get(endpoints.allPrompts);
      assert(response.body.length === helper.initialPrompts.length);
    });
  
    test('it should return the expected prompts', async () => {
      const promptsInDb = await helper.getPromptsInDb();
      const response = await api.get(endpoints.allPrompts)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      const promptContent = response.body.map((prompt) => prompt.content);
  
      assert(promptContent.includes(promptsInDb[0].content));
    });
  });

  describe('/prompts?active=true', () => {
    test('it should return only one prompt', async () => {
      const response = await api.get(endpoints.activePrompt)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      
      assert(response.body.length === 1);
    });

    test('it should return only the active prompt', async () => {
      const promptsInDb = await helper.getPromptsInDb();
      const activePrompt = promptsInDb.find((prompt) => (
        prompt.activePrompt === true
      ));

      const response = await api.get(endpoints.activePrompt)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert(response.body[0].content === activePrompt.content);
    });

    test('it should return inactive prompts if query value "false" is passed', async () => {
      const inactivePrompts = helper.initialPrompts.filter((prompt) => (
        !prompt.activePrompt
      ));

      const response = await api.get(endpoints.inactivePrompts)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert(response.body.length === inactivePrompts.length);
    });

    test('it should return all prompts if invalid query string is passed', async () => {
      const promptsInDb = await helper.getPromptsInDb();

      const response = await api.get('/api/prompts?foo=bar')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert(response.body.length === promptsInDb.length);
    });
  });

  describe('/prompts/:id', () => {
    test('it should return an individual prompt', async () => {
      const promptsInDb = await helper.getPromptsInDb();
      const target = promptsInDb[0];
  
      const response = await api.get(`${endpoints.allPrompts}/${target.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      assert.deepStrictEqual(response.body, target);
    });
  
    test('it should return 404 if a prompt does not exist', async () => {
      const id = await helper.getNonexistingID();
      await api.get(`${endpoints.allPrompts}/${id}`)
        .expect(404);
    });
  
    test('it should not return 400 if the ID is malformed', async () => {
      const malformedId = helper.malformedID;
      const response = await api.get(`${endpoints.allPrompts}/${malformedId}`)
        .expect(400);
  
      assert(response.body.error.includes('malformed ID'));
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
