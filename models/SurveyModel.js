const mongoose = require("../config/db")

const surveySchema = new mongoose.Schema({
  surveyId: String,
  category: String,
  country: String,
  cpi: Number,
  language: String,
  rating: Number,
  value: Number,
  userId: {
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, 
});

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
