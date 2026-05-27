const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { protect, teacherOnly, studentOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile } = require('../utils/cloudUpload');

// Submit assignment (student)
router.post('/', protect, studentOnly, upload.array('files', 10), async (req, res) => {
  try {
    const { assignment, text, urls } = req.body;
    const assignmentDoc = await Assignment.findOne({ _id: assignment, isActive: true });

    if (!assignmentDoc) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (!matchesUserScope(assignmentDoc, req.user)) {
      return res.status(403).json({ message: 'This assignment is not assigned to your course or batch' });
    }

    const existingSubmission = await Submission.findOne({
      assignment, student: req.user._id
    });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const files = req.files ? await Promise.all(req.files.map(async file => ({
      filename: file.originalname,
      filepath: await uploadFile(file, 'student-portal/assignment-submissions'),
      mimetype: file.mimetype
    }))) : [];

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
router.get('/assignment/:assignmentId', protect, teacherOnly, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      createdBy: req.user._id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

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

module.exports = router;

function matchesUserScope(item, user) {
  const courseMatches = !item.course || item.course === user.course;
  const batchMatches = !item.batch || item.batch === user.batch;
  return courseMatches && batchMatches;
}
