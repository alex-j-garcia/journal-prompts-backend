const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  content: String,
  tag: String,
  activePrompt: Boolean,
  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer'
    }
  ]
});

promptSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;
