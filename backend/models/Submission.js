const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    filename: String,
    filepath: String,
    mimetype: String
  }],
  urls: [{
    type: String,
    trim: true
  }],
  text: {
    type: String,
    default: ''
  },
  marks: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late', 'resubmit'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);