const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { protect, teacherOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile } = require('../utils/cloudUpload');

// Create assignment (teacher)
router.post('/', protect, teacherOnly, upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, subject, dueDate, totalMarks, batch, course } = req.body;
    const scopedCourse = req.user.course || course?.trim() || '';
    
    const attachments = req.files ? await Promise.all(req.files.map(async file => ({
      filename: file.originalname,
      filepath: await uploadFile(file, 'student-portal/assignments'),
      mimetype: file.mimetype
    }))) : [];

    const assignment = await Assignment.create({
      title, description, subject, dueDate, totalMarks,
      batch, course: scopedCourse, attachments,
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
    const query = { isActive: true };

    if (req.user.role === 'teacher') {
      query.createdBy = req.user._id;
    } else {
      query.$and = [
        { $or: [{ course: '' }, { course: { $exists: false } }, { course: req.user.course }] },
        { $or: [{ batch: '' }, { batch: { $exists: false } }, { batch: req.user.batch }] }
      ];
    }

    const assignments = await Assignment.find(query)
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
    if (req.user.role === 'student' && !matchesUserScope(assignment, req.user)) {
      return res.status(403).json({ message: 'This assignment is not assigned to your course or batch' });
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

function matchesUserScope(item, user) {
  const courseMatches = !item.course || item.course === user.course;
  const batchMatches = !item.batch || item.batch === user.batch;
  return courseMatches && batchMatches;
}
