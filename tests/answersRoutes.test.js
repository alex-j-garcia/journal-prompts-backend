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
const Answer = require('../models/answer');
const Prompt = require('../models/prompt');
const User = require('../models/user');
const helper = require('./tests-helper');
const endpoints = require('./endpoints');

const api = supertest(app);

describe('/api/answers', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Answer.deleteMany({});
    await Prompt.deleteMany({});

    const promptsToSave = helper.prompts.initialPrompts
      .map((prompt) => new Prompt(prompt));
    const promptPromises = promptsToSave.map((prompt) => prompt.save());

    const user = new User({ username: 'root' });
    const savedUser = await user.save();

    const answersToSave = helper.answers.initialAnswers
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

  it('should return answers in JSON format', async () => {
    await api
      .get(endpoints.allAnswers)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('should return all answers', async () => {
    const initialAnswers = helper.answers.initialAnswers;

    const response = await api
      .get(endpoints.allAnswers)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert(response.body.length === initialAnswers.length);
  });
  
  it('should return 201 on successful POST', async () => {
    const payload = helper.answers.getAnswerPayload();

    await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(201);
  });
  
  it('should return the answer in JSON format on successful POST', async () => {
    const payload = helper.answers.getAnswerPayload();

    await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  });
  
  it('should return the answer on successful POST', async () => {
    const payload = helper.answers.getAnswerPayload();

    const response = await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    assert(response.body.answer === payload.answer);
  });

  it('should associate anonymous posts with anonymous users', async () => {
    const activePrompt = await api.get(endpoints.allPrompts);
    
    const payload = helper.answers.getAnswerPayload();
    
    const response = await api
      .post(endpoints.allAnswers)
      .send({ ...payload, promptId: activePrompt.body.id })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const answers = await api.get(endpoints.allAnswers);

    const prompt = answers.body.filter((p) => p.id === response.body.id);
    
    assert(prompt[0].user.username === 'anonymous');
  });
  
  it('should respond with 400 if answer is too short', async () => {
    const payload = helper.answers.getAnswerPayload(1);

    const response = await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert(response.body.error === 'answer is too short');
  });
  
  it('should respond with 400 if answer is too long', async () => {
    const payload = helper.answers.getAnswerPayload(1500);

    const response = await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert(response.body.error === 'answer is too long');
  });

  it('should respond with 400 if answer is omitted', async () => {
    const payload = {};

    const response = await api
      .post(endpoints.allAnswers)
      .send(payload)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert(response.body.error === 'answer is required');
  });

  it('should associate user answers with existing users', async () => {
    const usersInDb = await helper.users.getUsersInDb();
    const nonAnonUser = usersInDb.find((user) => user.username === 'root');
    
    const activePrompt = await api.get(endpoints.allPrompts);
    
    const payload = helper.answers.getAnswerPayload();
    const response = await api
      .post(endpoints.allAnswers)
      .send({
        ...payload,
        promptId: activePrompt.body.id,
        user: nonAnonUser.id
      })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const answers = await api.get(endpoints.allAnswers);
    const targetAnswer = answers.body.find((a) => a.id === response.body.id);
    
    assert(targetAnswer.user.username === nonAnonUser.username);
  });
});

after(async () => {
  await mongoose.connection.close();
});
