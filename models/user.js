const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const User = new mongoose.model('User', userSchema);

module.exports = User;
