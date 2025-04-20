import mongoose from "mongoose";

const promptSchema = new mongoose.Schema({
  content: String,
  tag: String,
  activePrompt: Boolean,
});

promptSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Prompt = mongoose.model('Prompt', promptSchema);

export default Prompt;
