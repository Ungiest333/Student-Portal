const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  course: {
    type: String,
    trim: true
  },
  batch: {
    type: String,
    trim: true
  },
  enrollmentNo: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
