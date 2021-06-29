const Response = require('../models/responseModel');
const factory = require('./handlerFactory');

exports.setPostUserIds = (req, res, next) => {
  if (!req.body.post) req.body.post = req.params.postId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllResponses = factory.getAll(Response);
exports.getResponse = factory.getOne(Response);
exports.createResponse = factory.createOne(Response);
exports.updateResponse = factory.updateOne(Response);
exports.deleteResponse = factory.deleteOne(Response);
