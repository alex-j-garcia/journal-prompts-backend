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
