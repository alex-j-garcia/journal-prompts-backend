import { 
  it,
  describe,
  before,
  after,
  afterEach,
} from 'node:test';
import assert from 'node:assert/strict';
import Answer from '../models/answer.js';
import Prompt from '../models/prompt.js';
import User from '../models/user.js';
import endpoints from './endpoints.js';
import {
  api,
  setupTestDB,
  teardownTestDB
} from './setup.js';

import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
      const prompt = await (new Prompt({
        activePrompt: true,
        tag: faker.lorem.words(1),
        content: faker.lorem.words(4),
      }).save());
      const answer = await (new Answer({ 
        answer: faker.lorem.words(100),
        promptId: prompt.id,
       }).save());

      await api
        .get(`${endpoints.answers}?promptId=${prompt.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
  
    it('should return associated answers', async () => {
      const prompt = await (new Prompt({
        activePrompt: true,
        tag: faker.lorem.words(1),
        content: faker.lorem.words(4),
      }).save());
      await (new Answer({ 
        answer: faker.lorem.words(100),
        promptId: prompt.id,
      }).save());
      await (new Answer({ 
        answer: faker.lorem.words(100),
        promptId: prompt.id,
      }).save());

      const prompt2 = await (new Prompt({
        activePrompt: true,
        tag: faker.lorem.words(1),
        content: faker.lorem.words(4),
      }).save());
      await (new Answer({ 
        answer: faker.lorem.words(100),
        promptId: prompt2.id,
      }).save());
  
      const response = await api
        .get(`${endpoints.answers}?promptId=${prompt.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
        
      assert(response.body.length === 2);
    });
    
    it('should return 201 on successful POST', async () => {
      const payload = { answer: faker.lorem.words(50) };
  
      await api
        .post(endpoints.answers)
        .send(payload)
        .expect(201);
    });
    
    it('should return the answer in JSON format on successful POST', async () => {
      const payload = { answer: faker.lorem.words(50) };
  
      await api
        .post(endpoints.answers)
        .send(payload)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    });
    
    it('should return the answer on successful POST', async () => {
      const payload = { answer: faker.lorem.words(50) };
  
      const response = await api
        .post(endpoints.answers)
        .send(payload)
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      assert(response.body.answer === payload.answer);
    });
    
    it('should respond with 400 if answer is too short', async () => {
      const payload = { answer: faker.lorem.words(1) };
      
      const response = await api
      .post(endpoints.answers)
      .send(payload)
      .expect(400)
      .expect('Content-Type', /application\/json/);
      
      assert(response.body.error === 'answer is too short');
    });
    
    it('should respond with 400 if answer is too long', async () => {
      const payload = { answer: faker.lorem.words(1500) };
      
      const response = await api
      .post(endpoints.answers)
      .send(payload)
      .expect(400)
      .expect('Content-Type', /application\/json/);
      
      assert(response.body.error === 'answer is too long');
    });
    
    it('should respond with 400 if answer is omitted', async () => {
      const payload = {};
      
      const response = await api
      .post(endpoints.answers)
      .send(payload)
      .expect(400)
      .expect('Content-Type', /application\/json/);
      
      assert(response.body.error === 'answer is required');
    });

    it('should associate anonymous answers with anonymous users', async () => {
      const activePrompt = await (new Prompt({
        activePrompt: true,
        tag: faker.lorem.words(1),
        content: faker.lorem.words(4),
      }).save());
      
      const submittedAnswer = await api
        .post(endpoints.answers)
        .send({
          promptId: activePrompt.id,
          answer: faker.lorem.words(50),
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      const answers = await api.get(`${endpoints.answers}?promptId=${activePrompt.id}`);
      const targetAnswer = answers.body.find((answer) => (
        answer.id === submittedAnswer.body.id
      ));

      assert(targetAnswer.user.id === submittedAnswer.body.user.id);
      assert(targetAnswer.user.username.includes('anonymous'));
    });
  
    it('should associate user answers with existing users', async () => {
      const savedUser = await (new User({ username: 'ben-frank' }).save());
      
      const activePrompt = await (new Prompt({
        activePrompt: true,
        tag: faker.lorem.words(1),
        content: faker.lorem.words(4),
      }).save());

      const submittedAnswer = await api
        .post(endpoints.answers)
        .send({
          promptId: activePrompt._id.toString(),
          answer: faker.lorem.words(50),
          user: savedUser._id.toString(),
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      const answers = await api.get(`${endpoints.answers}?promptId=${activePrompt.id}`);
      
      const targetAnswer = answers.body.find((answer) => (
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

      const userForToken = {
        username: savedUser.username,
        id: savedUser._id.toString(),
      };

      const token = jwt.sign(userForToken, process.env.SECRET);
      
      const response = await api
        .get(endpoints.activePrompt)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    
      assert(response.body.answers.length === 0);
    });
    
    it('should return all answers if prompt is answered', async () => {
      const prompt = new Prompt({ content: faker.lorem.words(5), activePrompt: true });
      const promptObject = (await prompt.save()).toJSON();

      const userDocument = new User({ username: 'test_user' });
      const userObject = (await userDocument.save()).toJSON();

      const userForToken = {
        username: userObject.username,
        id: userObject.id,
      };
      const token = jwt.sign(userForToken, process.env.SECRET);
  
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
        .set('authorization', `Bearer ${token}`)
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
        .post(endpoints.answers)
        .send({
          answer: faker.lorem.words(100),
          promptId: activePromptObject.id,
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      const { user } = activeAnswerSubmission.body;
      const userForToken = {
        username: user.username,
        id: user.id,
      };
      const token = jwt.sign(userForToken, process.env.SECRET);
      
      await api
        .post(endpoints.answers)
        .send({
          answer: faker.lorem.words(100),
          promptId: inactivePromptObject.id,
        })
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const activePromptAndAnswers = await api
        .get(endpoints.activePrompt)
        .set('authorization', `Bearer ${token}`)
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
  
  describe('/login', () => {
    it('should return response in JSON format', async () => {
      await api
        .post(endpoints.login)
        .send({ password: faker.internet.password() })
        .expect('Content-Type', /application\/json/);
    });

    it('should return 401 if username is omitted', async () => {
      await api
        .post(endpoints.login)
        .send({ password: faker.internet.password() })
        .expect(401)
        .expect('Content-Type', /application\/json/);
    });

    it('should return 401 if password is omitted', async () => {
      await api
        .post(endpoints.login)
        .send({ username: faker.internet.username() })
        .expect(401)
        .expect('Content-Type', /application\/json/);
    });

    it('should return 401 if username does not exist', async () => {
      const response = await api
        .post(endpoints.login)
        .send({ 
          username: faker.internet.username(),
          password: faker.internet.password(),
        })
        .expect(401)
        .expect('Content-Type', /application\/json/);

      assert(response.body.error === 'invalid username or password');
    });

    it('should return 401 if password is invalid', async () => {
      const user = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };
      const passwordHash = await bcrypt.hash(user.password, 6);

      const userDoc = new User({
        username: user.username,
        passwordHash,
      });
      await userDoc.save();

      const response = await api
        .post(endpoints.login)
        .send({
          username: user.username,
          password: user.password.substring(1),
        })
        .expect(401)
        .expect('Content-Type', /application\/json/);

      assert(response.body.error === 'invalid username or password');
    });

    it('should return 200 if login is successful', async () => {
      const user = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };
      const passwordHash = await bcrypt.hash(user.password, 6);

      const userDoc = new User({
        username: user.username,
        passwordHash,
      });
      await userDoc.save();

      await api
        .post(endpoints.login)
        .send({
          username: user.username,
          password: user.password,
        })
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });


    it('should return the username and token on successful login', async () => {
      const user = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };
      const passwordHash = await bcrypt.hash(user.password, 6);

      const userDoc = new User({
        username: user.username,
        passwordHash,
      });
      const savedUser = await userDoc.save();

      const userForToken = {
        username: user.username,
        id: savedUser._id.toString(),
      };

      const token = jwt.sign(userForToken, process.env.SECRET);

      const response = await api
        .post(endpoints.login)
        .send({
          username: user.username,
          password: user.password,
        })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert(response.body.username === user.username);
      assert(response.body.token === token);
    });
  });
});
