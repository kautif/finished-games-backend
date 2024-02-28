const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  twitchId: String,
  googleId: String,
  displayName: String,
  profileImageUrl: String,
  // add any other fields you want to store
});

const User = mongoose.model('User', UserSchema);
module.exports = User;