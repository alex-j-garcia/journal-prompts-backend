import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const requestLogger = (request, response, next) => {
  logger.info(`[${request.method}] ${request.url}`);
  logger.info(`Query string: ${JSON.stringify(request.query)}`);
  logger.info(`Body: ${JSON.stringify(request.body)}`);
  next();
};

/**
 * Enriches the request body with the user's ID if a valid
 * bearer token exists.
 */
const getUserIdFromToken = (request, response, next) => {
  const authorizationHeader = request.headers.authorization;
  const hasAuthHeader = authorizationHeader
    && authorizationHeader.startsWith('Bearer ');
  
  if (hasAuthHeader) {
    const token = authorizationHeader.replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.SECRET);
    request.body.userId = decodedToken ? decodedToken.id : null;
  }

  next();
};

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ message: 'malformed ID' });
  } else if (error.name === 'ValidationError'
      && error.message.includes('is shorter than the minimum allowed length (100).')) {
    return response.status(400).send({ message: 'answer is too short' });
  } else if (error.name === 'ValidationError'
      && error.message.includes('is longer than the maximum allowed length (1500).')) {
    return response.status(400).send({ message: 'answer is too long' });
  } else if (error.name === 'ValidationError'
      && error.message.includes('answer: Path `answer` is required.')) {
    return response.status(400).send({ message: 'answer is required' });
  } else if (error.name === 'ValidationError'
      && error.message.includes('username: Path `username` is required.')) {
    return response.status(400).send({ message: 'property "username" is required' });
  } else if (error.name === 'MongoServerError'
      && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).send({ message: 'this username is already taken.' });
  } else if (error.name === 'MongooseError'
      && error.message.includes('buffering timed out after 10000ms')) {
    return response.status(400).send({ message: 'Unable to fetch prompt. Check internet connection and try again.' });
  }
  
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

export default {
  requestLogger,
  getUserIdFromToken,
  unknownEndpoint,
  errorHandler,
};
