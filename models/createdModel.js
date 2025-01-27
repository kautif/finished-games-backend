const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CreatedSchema = new Schema({
  twitchName: String,
  twitchId: String,
  date_created: String
});

const Created = mongoose.model('Created', CreatedSchema);


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

module.exports = Created;