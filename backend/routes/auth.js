const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, teacherOnly } = require('../middleware/auth');
const sendWelcomeEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, course, batch, enrollmentNo } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name, email, password, role, phone, course, batch, enrollmentNo
    });

    if (user) {
      // ✅ Send welcome email without blocking the response
      sendWelcomeEmail({
        name: user.name,
        email: user.email,
        role: user.role,
        course: user.course,
        batch: user.batch,
        enrollmentNo: user.enrollmentNo,
      }).catch(err => console.error('Welcome email failed:', err.message));

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        course: user.course,
        batch: user.batch,
        enrollmentNo: user.enrollmentNo,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        course: user.course,
        batch: user.batch,
        enrollmentNo: user.enrollmentNo,
        avatar: user.avatar,
        bio: user.bio,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.bio = req.body.bio || user.bio;
      user.course = req.body.course || user.course;
      user.batch = req.body.batch || user.batch;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        course: updatedUser.course,
        batch: updatedUser.batch,
        bio: updatedUser.bio,
        token: generateToken(updatedUser._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students (teacher only)
router.get('/students', protect, teacherOnly, async (req, res) => {
  try {
    const query = { role: 'student' };
    if (req.user.course) {
      query.course = req.user.course;
    }

    const students = await User.find(query).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Change Password
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect',
      });
    }

    // Set new password
    user.password = newPassword;

    await user.save();

    res.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;   
