const { 
  test,
  describe,
  before,
  after,
} = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Prompt = require('../models/prompt');

const api = supertest(app);

const initialPrompts = [
  {
    content: 'this is some test content',
    tag: 'this is a tag',
    date: new Date(),
  },
  {
    content: 'this is more content for testing purposes',
    tag: 'personality',
    date: new Date(),
  }
];

describe('/api/prompts', () => {
  before(async () => {
    await Prompt.deleteMany({});
    let noteToSave = new Prompt(initialPrompts[0]);
    await noteToSave.save();
    noteToSave = new Prompt(initialPrompts[1]);
    await noteToSave.save();
  });

  test('it should return all prompts', async () => {
    const response = await api.get('/api/prompts');
    assert(response.body.length === initialPrompts.length);
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
