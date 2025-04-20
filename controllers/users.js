import bcrypt from 'bcrypt'
import express from 'express';
import User from '../models/user.js';

const usersRouter = express.Router();

usersRouter.post('/', async (request, response, next) => {
  try {
    const SALT_ROUNDS = 10;
    
    const { username, password } = request.body;

    if (!password) {
      return response.status(400).send({ error: 'property "password" is required' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
    const user = new User({
      username,
      passwordHash,
    });
  
    const savedUser = await user.save();
  
    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
