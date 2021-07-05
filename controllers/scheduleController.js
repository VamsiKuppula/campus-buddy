const Schedule = require('../models/scheduleModel');
const factory = require('./handlerFactory');

exports.getAllSchedules = factory.getAll(Schedule);
exports.getSchedule = factory.getOne(Schedule);
exports.createSchedule = factory.createOne(Schedule);
exports.updateSchedule = factory.updateOne(Schedule);
exports.deleteSchedule = factory.deleteOne(Schedule);
