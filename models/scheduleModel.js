const mongoose = require('mongoose');
const moment = require('moment');

const periodSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'A period must have a subject'],
    },
    subjectCode: {
      type: String,
      //required: [true, 'A period must have a subject code'],
    },
    faculty: {
      type: String,
      required: [true, 'A period must have a faculty'],
    },
    startTime: {
      type: String,
      validate: {
        validator: function (val) {
          return new RegExp(
            '^(([1-9]|0[1-9]|1[0-2]{1}){1}:([0-5]{1}[0-9]{1}){1}([ ]?[a|p]m){1})|(([0-9]{1}|0[0-9]{1}|1[0-9]{1}|2[0-3]{1}):([0-5]{1}[0-9]{1}))$'
          ).test(val);
        },
        message:
          'Start time ({VALUE}) must be in proper hh:mm format',
      },
      required: [true, 'A period must have a start-time'],
    },
    endTime: {
      type: String,
      validate: {
        validator: function (val) {
          return new RegExp(
            '^(([1-9]|0[1-9]|1[0-2]{1}){1}:([0-5]{1}[0-9]{1}){1}([ ]?[a|p]m){1})|(([0-9]{1}|0[0-9]{1}|1[0-9]{1}|2[0-3]{1}):([0-5]{1}[0-9]{1}))$'
          ).test(val);
        },
        message:
          'Start time ({VALUE}) must be in proper hh:mm format',
      },
      required: [true, 'A period must have a end-time'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

periodSchema.virtual('duration').get(function () {
  const timeStart = new Date(
    `01/01/2007 ${this.startTime}`
  );
  const timeEnd = new Date(`01/01/2007 ${this.endTime}`);

  return moment
    .utc(
      moment(timeEnd, 'DD/MM/YYYY HH:mm:ss').diff(
        moment(timeStart, 'DD/MM/YYYY HH:mm:ss')
      )
    )
    .format('HH:mm');
});
// for weekdays schemas
const schemaObj = {};
[
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
].forEach((el) => {
  schemaObj[`${el}`] = {
    type: [periodSchema],
    required: [true, `A schedule must have ${el}'s period`],
    validate: {
      validator: function (val) {
        return val.length !== 0;
      },
      message: `There must be 1 or more periods in ${el}!`,
    },
  };
});
const scheduleSchema = new mongoose.Schema({
  branch: {
    type: String,
    enum: {
      values: ['cse', 'ece', 'eee', 'mech'],
      message:
        'Section must be either: cse, ece, eee, mech',
    },
    required: [true, 'A schedule must have branch'],
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
    required: [true, 'A schedule must have year'],
  },
  section: {
    type: String,
    enum: {
      values: ['a', 'b'],
      message: 'Section must be either: a, b',
    },
    required: [true, 'A schedule must have section'],
  },
  ...schemaObj,
});

scheduleSchema.index(
  {
    year: 1,
    branch: 1,
    section: 1,
  },
  { unique: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
