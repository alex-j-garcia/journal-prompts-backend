const express = require('express');
const promptsRouter = require('./controllers/prompts');

const app = express();
app.use('/api/prompts', promptsRouter);

app.listen(3001, () => {
  console.log('App listening on port 3001');
})
