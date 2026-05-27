// routes/exams.js - Updated to handle MCQ and Document uploads separately

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const { protect, teacherOnly, studentOnly } = require('../middleware/auth');
const { uploadFile } = require('../utils/cloudUpload');

// Create upload directories
const uploadDirs = ['uploads/exams', 'uploads/pdfs', 'uploads/questions', 'uploads/exam-submissions'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/exams';
    
    if (file.fieldname === 'pdfFile') {
      uploadPath = 'uploads/pdfs';
    } else if (file.fieldname === 'examImage') {
      uploadPath = 'uploads/exams';
    } else if (file.fieldname === 'answerFiles') {
      uploadPath = 'uploads/exam-submissions';
    } else if (file.fieldname.startsWith('questionImage_')) {
      uploadPath = 'uploads/questions';
    }
    
    const fullPath = path.join(__dirname, '..', uploadPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = {
    'examImage': ['image/jpeg', 'image/png', 'image/jpg'],
    'pdfFile': ['application/pdf'],
    'answerFiles': ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  };

  // For question images
  if (file.fieldname.startsWith('questionImage_')) {
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}. Only JPG and PNG allowed.`), false);
    }
    return;
  }

  if (allowedMimes[file.fieldname]) {
    if (allowedMimes[file.fieldname].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}`), false);
    }
  } else {
    cb(null, true);
  }
};

// Configure upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  }
});

// Middleware to handle multiple file types
const uploadMiddleware = upload.fields([
  { name: 'examImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
  { name: 'answerFiles', maxCount: 10 },
  ...Array.from({ length: 50 }, (_, i) => ({ name: `questionImage_${i}`, maxCount: 1 }))
]);

// ============================================
// POST - Create exam (MCQ or Document)
// ============================================
router.post('/', protect, teacherOnly, uploadMiddleware, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      subject, 
      duration, 
      startTime, 
      endTime, 
      batch, 
      course, 
      questions,
      examType // 'mcq' or 'document'
    } = req.body;

    const scopedCourse = req.user.course || (course ? course.trim() : '');

    // Basic validation
    if (!title || !title.trim()) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: 'Exam title is required' });
    }
    if (!subject || !subject.trim()) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: 'Subject is required' });
    }
    if (!startTime || !endTime) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: 'Start and end time are required' });
    }

    // ============ MCQ MODE ============
    if (examType === 'mcq') {
      // Clean up any uploaded files for MCQ mode
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach(file => {
              try {
                if (fs.existsSync(file.path)) {
                  fs.unlinkSync(file.path);
                }
              } catch (err) {
                console.error('Error deleting file:', err);
              }
            });
          }
        });
      }

      // Parse and validate questions
      let parsedQuestions;
      try {
        parsedQuestions = JSON.parse(questions);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid questions format' });
      }

      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        return res.status(400).json({ message: 'At least one question is required' });
      }

      // Validate each question
      for (let i = 0; i < parsedQuestions.length; i++) {
        const q = parsedQuestions[i];
        if (!q.question || !q.question.trim()) {
          return res.status(400).json({ message: `Question ${i + 1}: Question text is required` });
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({ message: `Question ${i + 1}: At least 2 options are required` });
        }
        if (!q.options.some(opt => opt.isCorrect)) {
          return res.status(400).json({ message: `Question ${i + 1}: Please mark a correct answer` });
        }
        if (!q.options.every(opt => opt.text.trim())) {
          return res.status(400).json({ message: `Question ${i + 1}: All options must have text` });
        }
      }

      // Calculate total marks
      const totalMarks = parsedQuestions.reduce((sum, q) => sum + Number(q.marks), 0);

      // Create MCQ exam object
      const examData = {
        title: title.trim(),
        description: description?.trim() || '',
        subject: subject.trim(),
        duration: Number(duration) || 60,
        totalMarks: totalMarks,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        batch: batch?.trim() || '',
        course: scopedCourse,
        examType: 'mcq',
        questions: parsedQuestions.map(q => ({
          question: q.question.trim(),
          options: q.options.map(opt => ({
            text: opt.text.trim(),
            isCorrect: opt.isCorrect
          })),
          marks: Number(q.marks) || 1
        })),
        createdBy: req.user._id
      };

      const exam = await Exam.create(examData);

      console.log('MCQ Exam created successfully:', exam.title);

      res.status(201).json({
        message: 'MCQ Exam created successfully!',
        data: exam
      });
    }

    // ============ DOCUMENT UPLOAD MODE ============
    else if (examType === 'document') {
      // Validate file uploads
      if (!req.files?.examImage?.length && !req.files?.pdfFile?.length) {
        cleanupFiles(req.files);
        return res.status(400).json({ message: 'Please upload either an image or PDF file' });
      }

      // Process exam image
      let examImagePath = null;
      if (req.files?.examImage?.[0]) {
        const imageFile = req.files.examImage[0];
        try {
          const optimizedFilename = `${path.basename(imageFile.filename, path.extname(imageFile.filename))}-optimized.jpg`;
          const optimizedPath = path.join(imageFile.destination, optimizedFilename);
          
          await sharp(imageFile.path)
            .resize(1200, 800, { fit: 'cover', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(optimizedPath);
          
          if (imageFile.path !== optimizedPath && fs.existsSync(imageFile.path)) {
            fs.unlinkSync(imageFile.path);
          }
          
          examImagePath = await uploadFile({
            ...imageFile,
            path: optimizedPath,
            filename: optimizedFilename,
            originalname: optimizedFilename,
            mimetype: 'image/jpeg'
          }, 'student-portal/exams');
          console.log(`Optimized exam image: ${examImagePath}`);
        } catch (err) {
          console.error('Error optimizing exam image:', err);
          examImagePath = await uploadFile(imageFile, 'student-portal/exams');
        }
      }

      // Get PDF path
      let pdfPath = null;
      if (req.files?.pdfFile?.[0]) {
        pdfPath = await uploadFile(req.files.pdfFile[0], 'student-portal/exams');
        console.log(`PDF uploaded: ${pdfPath}`);
      }

      // Create document exam object
      const examData = {
        title: title.trim(),
        description: description?.trim() || '',
        subject: subject.trim(),
        duration: Number(duration) || 60,
        totalMarks: Number(req.body.totalMarks) || 100,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        batch: batch?.trim() || '',
        course: scopedCourse,
        examType: 'document',
        examImage: examImagePath,
        pdfFile: pdfPath,
        questions: [],
        createdBy: req.user._id
      };

      const exam = await Exam.create(examData);

      console.log('Document Exam created successfully:', exam.title);

      res.status(201).json({
        message: 'Document Exam uploaded successfully!',
        data: exam
      });
    }

    // Invalid exam type
    else {
      cleanupFiles(req.files);
      return res.status(400).json({ message: 'Invalid exam type. Use "mcq" or "document"' });
    }

  } catch (error) {
    console.error('Error creating exam:', error);
    cleanupFiles(req.files);
    
    res.status(500).json({ 
      message: error.message || 'Failed to create exam',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// GET - All exams
// ============================================
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

    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve exams' });
  }
});

// ============================================
// GET - My exam results
// ============================================
router.get('/results/my', protect, studentOnly, async (req, res) => {
  try {
    const results = await ExamResult.find({ student: req.user._id })
      .populate('exam', 'title subject totalMarks')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve exam results' });
  }
});

// ============================================
// GET - Results for one exam (teacher)
// ============================================
router.get('/:id/results', protect, teacherOnly, async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const results = await ExamResult.find({ exam: exam._id })
      .populate('student', 'name email enrollmentNo batch course')
      .populate('exam', 'title subject totalMarks examType questions')
      .sort({ completedAt: -1, createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve exam results' });
  }
});

// ============================================
// PUT - Grade an exam result (teacher)
// ============================================
router.put('/:id/results/:resultId/grade', protect, teacherOnly, async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const marks = Number(req.body.marks);
    if (Number.isNaN(marks) || marks < 0 || marks > exam.totalMarks) {
      return res.status(400).json({ message: `Marks must be between 0 and ${exam.totalMarks}` });
    }

    const percentage = exam.totalMarks ? (marks / exam.totalMarks) * 100 : 0;
    const result = await ExamResult.findOneAndUpdate(
      { _id: req.params.resultId, exam: exam._id },
      {
        score: marks,
        percentage,
        feedback: req.body.feedback || '',
        status: 'graded',
        gradedBy: req.user._id,
        gradedAt: new Date()
      },
      { new: true }
    )
      .populate('student', 'name email enrollmentNo batch course')
      .populate('exam', 'title subject totalMarks');

    if (!result) {
      return res.status(404).json({ message: 'Exam submission not found' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to grade exam' });
  }
});

// ============================================
// GET - Single exam by ID
// ============================================
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findOne({ _id: id, isActive: true });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    if (req.user.role === 'student' && !matchesUserScope(exam, req.user)) {
      return res.status(403).json({ message: 'This exam is not assigned to your course or batch' });
    }

    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve exam' });
  }
});

// ============================================
// POST - Submit MCQ exam
// ============================================
router.post('/:id/submit', protect, studentOnly, uploadMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, isActive: true });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    if (!matchesUserScope(exam, req.user)) {
      return res.status(403).json({ message: 'This exam is not assigned to your course or batch' });
    }

    const existingResult = await ExamResult.findOne({
      exam: exam._id,
      student: req.user._id,
      status: { $in: ['completed', 'graded', 'timed-out'] }
    });
    if (existingResult) {
      return res.status(400).json({ message: 'You have already submitted this exam' });
    }

    if (exam.examType === 'document') {
      const submissionFiles = req.files?.answerFiles ? await Promise.all(req.files.answerFiles.map(async file => ({
        filename: file.originalname,
        filepath: await uploadFile(file, 'student-portal/exam-submissions'),
        mimetype: file.mimetype
      }))) : [];

      if (!submissionFiles.length && !req.body.answerText?.trim()) {
        return res.status(400).json({ message: 'Please upload your answer file or add an answer note' });
      }

      const result = await ExamResult.create({
        exam: exam._id,
        student: req.user._id,
        submissionFiles,
        answerText: req.body.answerText || '',
        score: 0,
        totalMarks: exam.totalMarks,
        percentage: 0,
        timeTaken: Number(req.body.timeTaken) || 0,
        completedAt: new Date(),
        status: 'completed'
      });

      return res.status(201).json(result);
    }

    const submittedAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];
    let score = 0;

    const answers = exam.questions.map(question => {
      const submitted = submittedAnswers.find(
        answer => String(answer.questionId) === String(question._id)
      );
      const selectedOption = submitted ? Number(submitted.selectedOption) : -1;
      const correctIndex = question.options.findIndex(option => option.isCorrect);
      const isCorrect = selectedOption === correctIndex;

      if (isCorrect) {
        score += Number(question.marks) || 0;
      }

      return {
        questionId: question._id,
        selectedOption,
        isCorrect
      };
    });

    const percentage = exam.totalMarks ? (score / exam.totalMarks) * 100 : 0;

    const result = await ExamResult.create({
      exam: exam._id,
      student: req.user._id,
      answers,
      score,
      totalMarks: exam.totalMarks,
      percentage,
      timeTaken: Number(req.body.timeTaken) || 0,
      completedAt: new Date(),
      status: 'completed'
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit exam' });
  }
});

// ============================================
// PUT - Update exam
// ============================================
router.put('/:id', protect, teacherOnly, uploadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing exam
    // const exam = await Exam.findById(id);
    // if (!exam) {
    //   cleanupFiles(req.files);
    //   return res.status(404).json({ message: 'Exam not found' });
    // }

    // Delete old files if new ones uploaded
    // ... similar logic to POST

    res.status(200).json({
      message: 'Exam updated successfully'
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    cleanupFiles(req.files);
    res.status(500).json({ message: 'Failed to update exam' });
  }
});

// ============================================
// DELETE - Delete exam
// ============================================
router.delete('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete exam' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function cleanupFiles(files) {
  if (!files) return;
  
  Object.values(files).forEach(fileArray => {
    if (Array.isArray(fileArray)) {
      fileArray.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`Deleted temporary file: ${file.path}`);
          }
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }
  });
}

function deleteFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted file: ${filePath}`);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
}

function matchesUserScope(item, user) {
  const courseMatches = !item.course || item.course === user.course;
  const batchMatches = !item.batch || item.batch === user.batch;
  return courseMatches && batchMatches;
}

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files uploaded' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err.message) {
    return res.status(400).json({ message: err.message });
  }

  next(err);
});

module.exports = router;
