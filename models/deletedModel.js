const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeletedSchema = new Schema({
  twitch_name: String,
  twitch_id: String,
  date_created: Date
});

const Deleted = mongoose.model('Deleted', DeletedSchema);


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

module.exports = Deleted;