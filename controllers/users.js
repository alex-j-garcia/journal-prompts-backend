const bcrypt = require('bcrypt');
const User = require('../models/user');
const usersRouter = require('express').Router();

usersRouter.post('/', async (request, response, next) => {
  const SALT_ROUNDS = 10;
  
  const { username, password } = request.body;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = new User({
    username,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
