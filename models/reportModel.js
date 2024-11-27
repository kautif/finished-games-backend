const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  twitchId: String,
  date: Date,
  user: String,
  issue: String,
  details: String
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;