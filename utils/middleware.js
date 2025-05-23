import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const requestLogger = (request, response, next) => {
  logger.info(`[${request.method}] ${request.url}`);
  logger.info(`Query string: ${JSON.stringify(request.query)}`);
  logger.info(`Body: ${JSON.stringify(request.body)}`);
  next();
};

const getTokenFromRequest = (request, response, next) => {
  const userTokenOrNull = request.get('authorization');
  
  if (userTokenOrNull && userTokenOrNull.startsWith('Bearer ')) {
    const token = userTokenOrNull.replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.SECRET);
    request.body.user = decodedToken ? decodedToken.id : null;
  }

  next();
};

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed ID' });
  } else if (error.name === 'ValidationError'
      && error.message.includes('is shorter than the minimum allowed length (100).')) {
    return response.status(400).send({ error: 'answer is too short' });
  } else if (error.name === 'ValidationError'
      && error.message.includes('is longer than the maximum allowed length (1500).')) {
    return response.status(400).send({ error: 'answer is too long' });
  } else if (error.name === 'ValidationError'
      && error.message.includes('answer: Path `answer` is required.')) {
    return response.status(400).send({ error: 'answer is required' });
  } else if (error.name === 'ValidationError'
      && error.message.includes('username: Path `username` is required.')) {
    return response.status(400).send({ error: 'property "username" is required' });
  } else if (error.name === 'MongoServerError'
      && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).send({ error: 'this username is already taken.' });
  }
  
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

export default {
  requestLogger,
  getTokenFromRequest,
  unknownEndpoint,
  errorHandler,
};
