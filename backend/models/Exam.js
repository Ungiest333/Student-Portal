const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  questionImage: {
    type: String,
    default: ''
  },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  marks: {
    type: Number,
    default: 1
  },
  explanation: {
    type: String,
    default: ''
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  questions: [questionSchema],
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  totalMarks: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batch: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    trim: true
  },
  examType: {
    type: String,
    enum: ['mcq', 'document'],
    default: 'mcq'
  },
  examImage: {
    type: String,
    default: ''
  },
  pdfFile: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showResults: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
