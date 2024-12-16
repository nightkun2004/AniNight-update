const mongoose = require("../config/db");

const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionImage: { type: String, required: false },
  inputType: { type: String, enum: ['text', 'single-choice', 'multiple-choice'], required: true },
  options: [{ type: String }],  // ตัวเลือกในคำถาม (ใช้ในกรณี single-choice หรือ multiple-choice)
  answers: [answerSchema]  // คำตอบที่ถูกต้อง
});

const userAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answerText: mongoose.Schema.Types.Mixed  // ใช้ Mixed เพื่อรองรับ text, single-choice หรือ multiple-choice
});

const responseSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [userAnswerSchema],  // Array ของคำตอบที่มี questionId และ answerText
  completedAt: { type: Date, default: Date.now }
});

const surveySchema = new mongoose.Schema({
  userid: {
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
  },
  surveyName: { type: String, required: true },
  questions: [questionSchema],
  responses: [responseSchema],  // เพิ่มฟิลด์ responses สำหรับเก็บคำตอบของผู้ใช้
  score: { type: Number, default: 0 },
  cpi: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
}, {
  timestamps: true  // เพิ่ม field createdAt และ updatedAt โดยอัตโนมัติ
});

const SurveyAdmin = mongoose.model('SurveyAdmin', surveySchema);

module.exports = SurveyAdmin;
