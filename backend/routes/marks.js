const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');
const { protect, teacherOnly, studentOnly } = require('../middleware/auth');

// Add marks (teacher)
router.post('/', protect, teacherOnly, async (req, res) => {
  try {
    const { student, subject, examType, marksObtained, totalMarks, remarks } = req.body;

    const marks = await Marks.create({
      student, subject, examType, marksObtained, totalMarks, remarks,
      givenBy: req.user._id
    });

    res.status(201).json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get marks for a student
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const marks = await Marks.find({ student: req.params.studentId })
      .populate('givenBy', 'name')
      .sort({ createdAt: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my marks (student)
router.get('/my', protect, studentOnly, async (req, res) => {
  try {
    const marks = await Marks.find({ student: req.user._id })
      .populate('givenBy', 'name')
      .sort({ createdAt: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all marks (teacher)
router.get('/', protect, teacherOnly, async (req, res) => {
  try {
    const marks = await Marks.find({ givenBy: req.user._id })
      .populate('student', 'name email enrollmentNo batch course')
      .sort({ createdAt: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update marks
router.put('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const marks = await Marks.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete marks
router.delete('/:id', protect, teacherOnly, async (req, res) => {
  try {
    await Marks.findByIdAndDelete(req.params.id);
    res.json({ message: 'Marks deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;