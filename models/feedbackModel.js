const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  twitchId: String,
  date: Date,
  topic: String,
  message: String
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);


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

module.exports = Feedback;