const Announcement = require('../models/announcementModel');
const factory = require('./handlerFactory');

exports.getAllAnnouncements = factory.getAll(Announcement);
exports.getAnnouncement = factory.getOne(Announcement, {
  path: 'user',
  select: 'name photo role',
});
exports.createAnnouncement =
  factory.createOne(Announcement);
exports.updateAnnouncement =
  factory.updateOne(Announcement);
exports.deleteAnnouncement =
  factory.deleteOne(Announcement);
