const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    rollNumber: req.body.rollNumber,
    section: req.body.section,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if password and email exists
  if (!email || !password)
    return next(
      new AppError('Please enter email and password!', 400)
    );

  // check if user exists and password is correct
  const user = await User.findOne({ email }).select(
    '+password'
  );

  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  )
    return next(
      new AppError('Incorrect email or password', 401)
    );

  // If ok, send to client

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Get and check token if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to gain access.',
        401
      )
    );
  }

  // verify token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // verify user
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        'The user corresponding to this token no longer exist!',
        401
      )
    );

  // check if user changed password after issuing token
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError(
        'User recently changed password, Please log in again!',
        401
      )
    );

  // Grant Access To Protected Resource
  req.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // Find user from POSTed email
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return next(
        new AppError(
          'There is no user with this email!',
          404
        )
      );
    }

    // generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // send token in email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject:
          'Your password reset token (valid for 10 min)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Try again later!'
        ),
        500
      );
    }
  }
);

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perfom this action',
          403
        )
      );
    }
    next();
  };
