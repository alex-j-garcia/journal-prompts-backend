const logger = require('../utils/logger')

const requestLogger = (request, response, next) => {
  logger.info(`[${request.method}] ${request.url}`);
  logger.info(`Query string: ${JSON.stringify(request.query)}`);
  logger.info(`Body: ${JSON.stringify(request.body)}`);
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
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
