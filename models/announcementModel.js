const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A announcement must not be empty!'],
    trim: true,
    minlength: [
      5,
      'A announcement must have equal or more than 5 characters',
    ],
    maxlength: [
      100,
      'A announcement must have equal or less than 100 characters',
    ],
  },
  content: {
    type: String,
    required: [true, 'An announcement must have content'],
  },
  type: {
    type: String,
    enum: {
      values: ['info', 'danger', 'success', 'light'],
      message:
        'Type must be either: info, danger, success, light',
    },
    required: [true, 'An announcement must have a type'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'An announcement must have a user'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  attachments: {
    type: String,
  },
});

const Announcement = mongoose.model(
  'Announcement',
  announcementSchema
);

module.exports = Announcement;
