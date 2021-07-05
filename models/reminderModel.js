const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A reminder must belong to a user!'],
    },
    reminder: {
      type: String,
      required: [true, 'A reminder must not be empty!'],
      trim: true,
      minlength: [
        5,
        'A reminder must have equal or more than 5 characters',
      ],
      maxlength: [
        100,
        'A reminder must have equal or less than 100 characters',
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
