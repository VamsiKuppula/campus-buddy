const mongoose = require('mongoose');

const AppError = require('../utils/appError');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A post must have an author'],
    },
    title: {
      type: String,
      required: [true, 'A post must have a title'],
      trim: true,
      minlength: [
        5,
        'Title must have equal or more than 5 characters',
      ],
      maxlength: [
        100,
        'Title must have equal or less than 100 characters',
      ],
    },
    content: {
      type: String,
      required: [true, 'A post must have content'],
      minlength: [
        40,
        'Title must have equal or more than 40 characters',
      ],
    },
    category: {
      type: String,
      required: [true, 'A post must have a category'],
      enum: {
        values: ['college', 'branch', 'year', 'section'],
        message:
          'Category must be either: college, branch, year, section',
      },
      default: 'college',
    },
    branch: {
      type: String,
      enum: {
        values: ['cse', 'ece', 'eee', 'mech'],
        message:
          'Section must be either: cse, ece, eee, mech',
      },
    },
    year: {
      type: Number,
      validate: {
        validator: function (val) {
          return (
            val >= new Date().getFullYear() - 4 &&
            val <= new Date().getFullYear()
          );
        },
        message: `Year ({VALUE}) must be in the range - ${
          new Date().getFullYear() - 4
        } to ${new Date().getFullYear()}`,
      },
    },
    section: {
      type: String,
      enum: {
        values: ['a', 'b'],
        message: 'Section must be either: a, b',
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);
/*
postSchema.virtual('curYear').get(function () {
  if (this.year === -1) return null;
  const curDate = new Date();
  return curDate.getFullYear() * 1 - this.year;
});
*/
postSchema.virtual('responses', {
  ref: 'Response',
  foreignField: 'post',
  localField: '_id',
  match: { parentResponse: { $eq: null } },
});

postSchema.index(
  {
    author: 1,
    title: 1,
    category: 1,
  },
  { unique: true }
);

postSchema.pre('save', function (next) {
  if (this.category === 'college') {
    this.branch = undefined;
    this.year = undefined;
    this.section = undefined;
  } else if (this.category === 'branch') {
    if (!this.branch)
      return next(
        new AppError('This post must have a branch', 400)
      );
    this.year = undefined;
    this.section = undefined;
  } else if (this.category === 'year') {
    if (!this.branch || !this.year)
      return next(
        new AppError(
          'This post must have a branch and year',
          400
        )
      );
    this.section = undefined;
  } else if (this.category === 'section') {
    if (!this.branch || !this.year || !this.section)
      return next(
        new AppError(
          'This post must have a branch, year and section',
          400
        )
      );
  }
  next();
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: '-__v -passwordChangedAt',
  });

  this.populate({
    path: 'responses',
    select: '-__v',
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
