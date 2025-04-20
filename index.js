import app from './app.js';
import { connectDB } from './db.js';
import config from './utils/config.js';
import logger from './utils/logger.js';

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
