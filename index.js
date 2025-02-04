const app = require('./app');
const { connectDB, closeDB } = require('./db');
const config = require('./utils/config');
const logger = require('./utils/logger');

connectDB()
  .then(() => {
    logger.info('Successfully connected to MongoDB');
  })
  .catch((error) => {
    logger.error(`Error connecting to MongoDB: ${error}`)
  });

app.listen(config.PORT, () => {
  logger.info(`App listening on port ${config.PORT}`);
});
