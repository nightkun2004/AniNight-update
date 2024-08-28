const mongoose = require("../config/db")

const questionSchema = new mongoose.Schema({
  questionText: String,
  inputType: { type: String, enum: ['text', 'single-choice', 'multiple-choice'] },
  options: [String], // ใช้เฉพาะเมื่อ inputType เป็น single-choice หรือ multiple-choice
});

const surveySchema = new mongoose.Schema({
  surveyName: String,
  questions: [questionSchema],
  answers: [String],
  score: Number,
  published: { type: Boolean, default: false },
});

const SurveyAdmin = mongoose.model('SurveyAdmin', surveySchema);

module.exports = SurveyAdmin;
