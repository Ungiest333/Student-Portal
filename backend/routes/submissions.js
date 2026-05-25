const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { protect, teacherOnly, studentOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Submit assignment (student)
router.post('/', protect, studentOnly, upload.array('files', 10), async (req, res) => {
  try {
    const { assignment, text, urls } = req.body;

    const existingSubmission = await Submission.findOne({
      assignment, student: req.user._id
    });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const files = req.files ? req.files.map(file => ({
      filename: file.originalname,
     filepath: `uploads/${file.filename}`,
      mimetype: file.mimetype
    })) : [];

    const parsedUrls = urls ? JSON.parse(urls) : [];

    const submission = await Submission.create({
      assignment,
      student: req.user._id,
      files,
      urls: parsedUrls,
      text
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get submissions for an assignment (teacher)
router.get('/assignment/:assignmentId', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email enrollmentNo batch course')
      .populate('assignment', 'title totalMarks');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my submissions (student)
router.get('/my', protect, studentOnly, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title subject dueDate totalMarks');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade submission (teacher)
router.put('/grade/:id', protect, teacherOnly, async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marks, feedback, status: 'graded' },
      { new: true }
    ).populate('student', 'name email');
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;