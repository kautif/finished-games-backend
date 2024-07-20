const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  img_url: String,
  summary: String,
  date_added: Date
}, { _id: false });

const UserSchema = new Schema({
  twitchId: String,
  twitchName: String,
  profileImageUrl: String,
  games: {
    type: [GameSchema],
    default: [],
    validate: {
      validator: function(games) {
        const gameNames = games.map(game => game.name);
        return new Set(gameNames).size === gameNames.length; // Ensure unique game names
      },
      message: 'Game names must be unique'
    }
  }
});

const User = mongoose.model('User', UserSchema);


// ======= INDEXING ===========
// User.collection.dropIndexes({ 'games.name': 1 });
// User.collection.createIndex(
//   { 'games.name': 1 },
//   {
//     partialFilterExpression: { 'games.0': { $exists: true } },
//     unique: true,
//     name: 'unique_games_names'
//   }
// );

module.exports = User;