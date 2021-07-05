const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title must not be empty!'],
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
    materials: {
      type: [String],
      required: [true, 'Materials must not be empty!'],
      validate: {
        validator: function (val) {
          return val.length !== 0;
        },
        message: 'Materials must not be empty!',
      },
    },
  },
  {
    timestamps: true,
  }
);

const material = mongoose.model('material', materialSchema);

module.exports = material;
