const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  answer: String,
  author: {
    username: String,
  },
});

answerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
