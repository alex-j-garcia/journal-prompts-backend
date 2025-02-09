const { 
  it,
  describe,
  before,
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

    it('should associate anonymous answers with anonymous users', async () => {
      const activePromptDoc = new Prompt({
        activePrompt: true,
        tag: faker.lorem.words(1),
        content: faker.lorem.words(4),
      });
      const activePrompt = (await activePromptDoc.save()).toJSON();
      
      const submittedAnswer = await api
        .post(endpoints.allAnswers)
        .send({
          promptId: activePrompt.id,
          answer: faker.lorem.words(50),
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      const allAnswers = await api.get(endpoints.allAnswers);
      const prompt = allAnswers.body.find((answer) => (
        answer.id === submittedAnswer.body.id
      ));
      
      assert(prompt.user.id === submittedAnswer.body.user);
      assert(prompt.user.username.includes('anonymous'));
    });
  
    it('should associate user answers with existing users', async () => {
      const userDoc = new User({ username: 'ben-frank' });
      const savedUser = (await userDoc.save()).toJSON();
      
      const activePromptDoc = new Prompt({
        activePrompt: true,
        tag: faker.lorem.words(1),
        content: faker.lorem.words(4),
      });
      const savedPrompt = (await activePromptDoc.save()).toJSON();

      const submittedAnswer = await api
        .post(endpoints.allAnswers)
        .send({
          user: savedUser.id,
          promptId: savedPrompt.id,
          answer: faker.lorem.words(50),
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      const allAnswers = await api.get(endpoints.allAnswers);
      const targetAnswer = allAnswers.body.find((answer) => (
        answer.id === submittedAnswer.body.id
      ));
      
      assert(targetAnswer.user.username === savedUser.username);
    });
  });

  describe('/prompts', () => {
    it('should return prompt in JSON format', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      await prompt.save();
      
      await api
        .get(endpoints.activePrompt)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
  
    it('should return one prompt', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      await prompt.save();
      const promptObject = prompt.toJSON();
  
      const response = await api
        .get(endpoints.activePrompt)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      assert(response.body.content === promptObject.content);
    });
  
    it('should return the active prompt', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      await prompt.save();
  
      const response = await api
        .get(endpoints.activePrompt)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      assert(response.body.activePrompt);
    });
  
    it('should not return answers if the user does not exist', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true});
      await prompt.save();
  
      const response = await api
        .get(endpoints.activePrompt)
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
        .get(endpoints.activePrompt)
        .set('user', savedUser._id.toString())
        .expect(200)
        .expect('Content-Type', /application\/json/);
    
      assert(response.body.answers.length === 0);
    });
    
    it('should return all answers if prompt is answered', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true });
      const promptObject = (await prompt.save()).toJSON();

      const userDocument = new User({ username: 'test_user' });
      const userObject = (await userDocument.save()).toJSON();
  
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
        .get(endpoints.activePrompt)
        .set('user', userObject.id)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      assert(response.body.answers.length === 2);
    });

    it('should only return answers for the active prompt', async () => {
      const activePrompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true });
      const inactivePrompt = new Prompt({ content: faker.lorem.words(5), activePrompt: false });
      const activePromptObject = (await activePrompt.save()).toJSON();
      const inactivePromptObject = (await inactivePrompt.save()).toJSON();

      const activeAnswerSubmission = await api
        .post(endpoints.allAnswers)
        .send({
          answer: faker.lorem.words(100),
          promptId: activePromptObject.id,
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      const { user } = activeAnswerSubmission.body;

      await api
        .post(endpoints.allAnswers)
        .send({
          answer: faker.lorem.words(100),
          promptId: inactivePromptObject.id,
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const activePromptAndAnswers = await api
        .get(endpoints.activePrompt)
        .set('user', user)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      assert(activePromptAndAnswers.body.answers.every((answer) => (
        answer.promptId === activePromptObject.id
      )));
    });
  });

  describe('/users', () => {
    it('should return response in JSON format', async () => {
      await api
        .post(endpoints.createUser)
        .send({
          username: faker.internet.username(),
          password: faker.internet.password(),
        })
        .expect('Content-Type', /application\/json/);
    });
    
    it('should return 201 if user is successfully created', async () => {
      await api
        .post(endpoints.createUser)
        .send({
          username: faker.internet.username(),
          password: faker.internet.password(),
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);
    });

    it('should create a new user on successful POST', async () => {
      const usersAtTestStart = await User.find({});
      
      const response = await api
        .post(endpoints.createUser)
        .send({
          username: faker.internet.username(),
          password: faker.internet.password(),
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      const usersAtTestEnd = await User.find({});
      
      assert(usersAtTestEnd.length === usersAtTestStart.length + 1);
      assert(usersAtTestEnd.find((user) => user.username === response.body.username));
    });

    it('should never reveal the passwordHash user property', async () => {
      const response = await api
        .post(endpoints.createUser)
        .send({
          username: faker.internet.username(),
          password: faker.internet.password(),
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);

      assert(response.body.passwordHash === undefined);
    });

    it('should return 400 if username is omitted', async () => {
      await api
        .post(endpoints.createUser)
        .send({
          password: faker.internet.password(),
        })
        .expect(400)
        .expect('Content-Type', /application\/json/);
    });

    it('should return an error message if username is omitted', async () => {
      const response = await api
        .post(endpoints.createUser)
        .send({
          password: faker.internet.password(),
        })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      assert(response.body.error === 'property "username" is required');
    });

    it('should return 400 if password is ommitted', async () => {
      await api
        .post(endpoints.createUser)
        .send({
          username: faker.internet.username(),
        })
        .expect(400)
        .expect('Content-Type', /application\/json/);
    });

    it('should return an error message if password is ommitted', async () => {
      const response = await api
        .post(endpoints.createUser)
        .send({
          username: faker.internet.username(),
        })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      assert(response.body.error === 'property "password" is required');
    });

    it('should return 400 if username is not unique', async () => {
      const repeatUsername = faker.internet.username();

      await api
        .post(endpoints.createUser)
        .send({
          username: repeatUsername,
          password: faker.internet.password(),
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);

      await api
        .post(endpoints.createUser)
        .send({
          username: repeatUsername,
          password: faker.internet.password(),
        })
        .expect(400)
        .expect('Content-Type', /application\/json/);
    });

    it('should return an error message if username is not unique', async () => {
      const repeatUsername = faker.internet.username();

      await api
        .post(endpoints.createUser)
        .send({
          username: repeatUsername,
          password: faker.internet.password(),
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const response = await api
        .post(endpoints.createUser)
        .send({
          username: repeatUsername,
          password: faker.internet.password(),
        })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      assert(response.body.error === 'this username is already taken.');
    });

    it('should not create a new user on unsuccessful POST', async () => {
      const usersAtTestStart = await User.find({});

      await api
        .post(endpoints.createUser)
        .send({ password: faker.internet.password(), })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      await api
        .post(endpoints.createUser)
        .send({ username: faker.internet.username(), })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const usersAtTestEnd = await User.find({});

      assert(usersAtTestEnd.length === usersAtTestStart.length);
    });
  });
});
