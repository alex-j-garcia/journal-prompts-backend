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
const Answer = require('../models/answer');
const Prompt = require('../models/prompt');
const User = require('../models/user');
const helper = require('./tests-helper');
const endpoints = require('./endpoints');

const { faker } = require('@faker-js/faker');

const api = supertest(app);

describe('/api/answers', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Answer.deleteMany({});
    await Prompt.deleteMany({});

    const promptsToSave = helper
      .prompts
      .initialPrompts
      .map((prompt) => new Prompt(prompt));
    const promptPromises = promptsToSave.map((prompt) => prompt.save());

    const user = new User({ username: 'root' });
    const savedUser = await user.save();

    const answersToSave = helper
      .answers
      .initialAnswers
      .map((answer) => new Answer({
      ...answer,
      user: savedUser._id.toString(),
    }));
    const answerPromises = answersToSave.map((answer) => answer.save());

    await Promise.all([
      ...promptPromises,
      ...answerPromises,
    ]);
  });

  test('it should return answers in JSON format', async () => {
    await api
      .get(endpoints.allAnswers)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('it should return all answers', async () => {
    const initialAnswers = helper.answers.initialAnswers;

    const response = await api
      .get(endpoints.allAnswers)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert(response.body.length === initialAnswers.length);
  });
  
  test('it should return 201 on successful POST', async () => {
    const payload = {
      answer: faker.lorem.words(100),
    };

    await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(201);
  });
  
  test('it should return the answer in JSON format on successful POST', async () => {
    const payload = {
      answer: faker.lorem.words(100),
    };

    await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  });
  
  test('it should return the answer on successful POST', async () => {
    const payload = {
      answer: faker.lorem.words(100),
    };

    const response = await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    assert(response.body.answer === payload.answer);
  });

  test('it should associate anonymous posts with anonymous users', async () => {
    const activePrompt = await api.get(endpoints.allPrompts);
    
    const payload = {
      answer: faker.lorem.words(100),
      promptId: activePrompt.body.id,
    };
    
    const response = await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const answers = await api.get(endpoints.allAnswers);

    const prompt = answers.body.filter((p) => p.id === response.body.id);
    
    assert(prompt[0].user.username === 'anonymous');
  });
  
  // test('it should respond with 400 if answer is too short', async () => {});

  // test('it should associate user notes with existing users', async () => {});
  // test('it should respond with 400 if answer is too long', async () => {});
  // test('it should respond with 400 if answer is omitted', async () => {});
});

after(async () => {
  await mongoose.connection.close();
});
