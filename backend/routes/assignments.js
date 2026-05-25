const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { protect, teacherOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create assignment (teacher)
router.post('/', protect, teacherOnly, upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, subject, dueDate, totalMarks, batch, course } = req.body;
    
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      filepath: file.path,
      mimetype: file.mimetype
    })) : [];

    const assignment = await Assignment.create({
      title, description, subject, dueDate, totalMarks,
      batch, course, attachments,
      createdBy: req.user._id
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all assignments
router.get('/', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single assignment
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update assignment
router.put('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete assignment
router.delete('/:id', protect, teacherOnly, async (req, res) => {
  try {
    await Assignment.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;