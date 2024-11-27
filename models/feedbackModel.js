const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  twitchId: String,
  date: Date,
  topic: String,
  message: String
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;