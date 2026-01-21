import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  answer: {
    type: String,
    required: true,
    minLength: 100,
    maxLength: 1500,
  },
  promptId: mongoose.Schema.Types.ObjectId,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});

answerSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Answer = mongoose.model('Answer', answerSchema);

export default Answer;
