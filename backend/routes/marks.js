const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const legacyMarksMessage = {
  message: 'The separate marks system is disabled. Grade students from the Exam section only.'
};

router.use(protect);

router.get('*', (req, res) => {
  res.status(410).json(legacyMarksMessage);
});

router.post('*', (req, res) => {
  res.status(410).json(legacyMarksMessage);
});

router.put('*', (req, res) => {
  res.status(410).json(legacyMarksMessage);
});

router.delete('*', (req, res) => {
  res.status(410).json(legacyMarksMessage);
});

module.exports = router;
