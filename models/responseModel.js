const mongoose = require('mongoose');
/*
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A comment must have a user!'],
  },
  comment: {
    type: String,
    required: [true, 'A comment cannot be empty!'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
*/

const responseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A response must have a user!'],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'A response must belong to a post!'],
    },
    response: {
      type: String,
      required: [true, 'A response cannot be empty!'],
      minlength: [
        5,
        'Response must have equal or more than 5 characters',
      ],
    },
    parentResponse: {
      type: mongoose.Schema.ObjectId,
      ref: 'Response',
      default: null,
      required: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

responseSchema.virtual('replies', {
  ref: 'Response',
  foreignField: 'parentResponse',
  localField: '_id',
});

responseSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '-__v -passwordChangedAt -email -rollNumber',
  });
  //this.find({ parentResponse: { $eq: null } });
  this.populate('replies');
  next();
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
