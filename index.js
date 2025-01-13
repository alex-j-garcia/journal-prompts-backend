const express = require('express');
const mongoose = require('mongoose');
const promptsRouter = require('./controllers/prompts');
require('dotenv').config();

const app = express();
app.use('/api/prompts', promptsRouter);

app.listen(3001, () => {
  console.log('App listening on port 3001');
})

mongoose.set('strictQuery', false);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('successsfully connected to MongoDB')
  })
  .catch((error) => {
    console.log(`a MongoDB connection error occurred: ${error}`);
  });
