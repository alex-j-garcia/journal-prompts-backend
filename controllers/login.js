import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import express from 'express';
import User from '../models/user.js';

const loginRouter = express.Router();

loginRouter.post('/', async (request, response, next) => {
  const { username, password } = request.body;
  
  try {
    const user = await User.findOne({ username });
    const isPasswordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash);
  
    if (!(user && isPasswordCorrect)) {
      return response.status(401).json({
        message: 'invalid username/password combination'
      });
    }
  
    const userForToken = {
      username,
      id: user.id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET);

    response.status(200).send({
      token,
      username,
    });
  } catch (error) {
    next(error);
  }
});

export default loginRouter;
