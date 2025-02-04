const { 
  it,
  describe,
  before,
  beforeEach,
  after,
  afterEach,
} = require('node:test');
const assert = require('node:assert/strict');
const Answer = require('../models/answer');
const Prompt = require('../models/prompt');
const User = require('../models/user');
const endpoints = require('./endpoints');
const {
  api,
  setupTestDB,
  teardownTestDB
} = require('./setup');

const { faker } = require('@faker-js/faker')

describe('/api', () => {
  before(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    // const prompts = helper.prompts.initialPrompts.map(
    //   (prompt) => new Prompt(prompt)
    // );
    // const promptPromises = prompts.map((document) => document.save());

    // const user = new User({ username: 'root' });
    // const savedUser = await user.save();

    // const answers = helper.answers.initialAnswers.map(
    //   (answer) => new Answer({
    //     ...answer,
    //     user: savedUser._id.toString(),
    //   }));
    // const answerPromises = answers.map((document) => document.save());

    // await Promise.all([
    //   ...promptPromises,
    //   ...answerPromises,
    // ]);
  });

  after(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Prompt.deleteMany({});
    await Answer.deleteMany({});
  });

  describe('/answers', () => {
    it('should return answers in JSON format', async () => {
      const answer = new Answer({ answer: faker.lorem.words(100) });
      await answer.save();

      await api
        .get(endpoints.allAnswers)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
  
    it('should return all answers', async () => {
      const answer = new Answer({ answer: faker.lorem.words(50) });
      await answer.save();

      const answer2 = new Answer({ answer: faker.lorem.words(50) });
      await answer2.save();
  
      const response = await api
        .get(endpoints.allAnswers)
        .expect(200)
        .expect('Content-Type', /application\/json/);
        
      assert(response.body.length === 2);
    });
    
    it('should return 201 on successful POST', async () => {
      const payload = { answer: faker.lorem.words(50) };
  
      await api
        .post(endpoints.allAnswers)
        .send(payload)
        .expect(201);
    });
    
    it('should return the answer in JSON format on successful POST', async () => {
      const payload = { answer: faker.lorem.words(50) };
  
      await api
        .post(endpoints.allAnswers)
        .send(payload)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    });
    
    it('should return the answer on successful POST', async () => {
      const payload = { answer: faker.lorem.words(50) };
  
      const response = await api
        .post(endpoints.allAnswers)
        .send(payload)
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      assert(response.body.answer === payload.answer);
    });
  
    it('should associate anonymous posts with anonymous users', async () => {
      const activePromptDoc = new Prompt({
        content: faker.lorem.words(4),
        tag: faker.lorem.words(1),
        activePrompt: true
      });
      const activePrompt = (await activePromptDoc.save()).toJSON();

      const otherPromptDoc = new Prompt({
        content: faker.lorem.words(4),
        tag: faker.lorem.words(1),
      });
      const otherPrompt = (await activePromptDoc.save()).toJSON();
      
      const payload = { answer: faker.lorem.words(50) };
      
      const response = await api
        .post(endpoints.allAnswers)
        .send({ ...payload, promptId: activePrompt.id })
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      const answers = await api.get(endpoints.allAnswers);
  
      const prompt = answers.body.find((p) => p.id === response.body.id);
      
      assert(prompt.user.username === 'anonymous');
    });
    
    it('should respond with 400 if answer is too short', async () => {
      const payload = { answer: faker.lorem.words(1) };
  
      const response = await api
        .post(endpoints.allAnswers)
        .send(payload)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
      assert(response.body.error === 'answer is too short');
    });
    
    it('should respond with 400 if answer is too long', async () => {
      const payload = { answer: faker.lorem.words(1500) };
  
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
      const user = new User({ username: 'ben-frank' });
      const savedUser = (await user.save()).toJSON();
      
      const activePromptDoc = new Prompt({
        content: faker.lorem.words(4),
        tag: faker.lorem.words(1),
        activePrompt: true
      });
      const activePrompt = (await activePromptDoc.save()).toJSON();
      
      const payload = { answer: faker.lorem.words(50) };

      const response = await api
        .post(endpoints.allAnswers)
        .send({
          ...payload,
          promptId: activePrompt.id,
          user: savedUser.id
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      const answers = await api.get(endpoints.allAnswers);
      const targetAnswer = answers.body.find((a) => a.id === response.body.id);
      
      assert(targetAnswer.user.username === savedUser.username);
    });
  });

  describe('/prompts', () => {
    it('should return prompt in JSON format', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      await prompt.save();
      
      await api
        .get(endpoints.allPrompts)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
  
    it('should return one prompt', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      await prompt.save();
      const promptObject = prompt.toJSON();
  
      const response = await api
        .get(endpoints.allPrompts)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      assert(response.body.content === promptObject.content);
    });
  
    it('should return the active prompt', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      await prompt.save();
  
      const response = await api
        .get(endpoints.allPrompts)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      assert(response.body.activePrompt);
    });
  
    it('should not return answers if the user does not exist', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      await prompt.save();
  
      const response = await api
        .get(endpoints.allPrompts)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      assert(response.body.answers.length === 0);
    });
    
    it('should not return answers if prompt is unanswered', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      await prompt.save();
      
      const userDocument = new User({ username: 'test_user' });
      const savedUser = await userDocument.save();
      
      const response = await api
        .get(endpoints.allPrompts)
        .set('user', savedUser._id.toString())
        .expect(200)
        .expect('Content-Type', /application\/json/);
    
      assert(response.body.answers.length === 0);
    });
    
    it('should return all answers if prompt is answered', async () => {  
      // create and save new prompt
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      const promptObject = (await prompt.save()).toJSON();
  
      // create and save new user
      const userDocument = new User({ username: 'test_user' });
      const userObject = (await userDocument.save()).toJSON();
  
      // create and save answer with promptID and userID
      const answer = new Answer({
        answer: faker.lorem.words(100),
        promptId: promptObject.id,
        user: userObject.id,
      });
      await answer.save();
  
      const anotherAnswer = new Answer({
        answer: faker.lorem.words(100),
        promptId: promptObject.id,
        user: userObject.id,
      });
      await anotherAnswer.save();
      
      const response = await api
        .get(endpoints.allPrompts)
        .set('user', userObject.id)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      assert(response.body.answers.length === 2);
    });
  });
});
