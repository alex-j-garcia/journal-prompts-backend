import { configDotenv } from "dotenv";
import path from 'path';

configDotenv({
  path: path.resolve(import.meta.dirname, '../env/.env')
});

const PORT = process.env.PORT;
const MONGODB_URI = process.env.NODE_ENV === 'test'
? process.env.TEST_MONGODB_URI
: process.env.MONGODB_URI;

export default {
  MONGODB_URI,
  PORT,
}
