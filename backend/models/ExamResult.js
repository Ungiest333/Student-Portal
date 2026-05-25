const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedOption: Number,
    isCorrect: Boolean
  }],
  submissionFiles: [{
    filename: String,
    filepath: String,
    mimetype: String
  }],
  answerText: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'timed-out', 'graded'],
    default: 'in-progress'
  },
  feedback: {
    type: String,
    default: ''
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('ExamResult', examResultSchema);
