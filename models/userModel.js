const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  twitchId: String,
  twitchName: String,
  profileImageUrl: String,
  games: {
    type: Array,
    game: {
      name: String,
      img_url: String,
      summary: String,
      unique: [true, "This game is already on your profile"]
    }
  }
  // add any other fields you want to store
});

const User = mongoose.model('User', UserSchema);
module.exports = User;