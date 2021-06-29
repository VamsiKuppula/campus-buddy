const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email!'],
    validate: [
      validator.isEmail,
      'Please enter a valid email',
    ],
  },
  rollNumber: {
    type: String,
    unique: true,
    required: [true, 'Please provide your roll number'],
    validate: {
      validator: function (val) {
        const curYear = new Date().getFullYear() - 2000;
        const year = val.slice(0, 2) * 1;
        const college = val.slice(2, 4);
        const course = val.slice(5, 6);
        const branch = val.slice(6, 8) * 1;
        if (
          val.length !== 10 ||
          !(year <= curYear && year >= curYear - 4) ||
          college !== 'MD' ||
          course !== 'A' ||
          !(branch >= 2 && branch <= 5)
        )
          return false;
        return true;
      },
      message: 'Please enter a valid roll number',
    },
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'hod', 'faculty', 'cr', 'student'],
      message:
        'Role must be either: admin, hod, faculty, cr, student',
    },
    default: 'student',
  },
  year: Number,
  branch: String,
  section: {
    type: String,
    enum: {
      values: ['a', 'b'],
      message: 'Section must be either: a, b',
    },
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [
      8,
      'A password must be greater than or equal to 8 characters',
    ],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  // Setting branch and year
  if (!this.isModified('year'))
    this.year = this.rollNumber.slice(0, 2) * 1 + 2000;
  if (!this.isModified('branch')) {
    const branchCode = this.rollNumber.slice(6, 8) * 1 - 2;
    const branches = ['eee', 'mech', 'ece', 'cse'];
    this.branch = branches[branchCode];
  }
  if (!this.isModified('role')) {
    if (this.rollNumber.length === 10)
      this.role = 'student';
  }

  // Setting password
  if (!this.isModified('password')) return next();

  // Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Remove passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew)
    return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

// methods
userSchema.methods.changedPasswordAfter = function (
  JWTIssuedTime
) {
  if (this.passwordChangedAt) {
    const changedPasswordTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTIssuedTime < changedPasswordTime;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.generatePasswordResetToken =
  function () {
    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');

    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
  };

const User = mongoose.model('User', userSchema);

module.exports = User;
