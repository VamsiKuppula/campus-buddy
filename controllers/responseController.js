const Response = require('../models/responseModel');
const factory = require('./handlerFactory');

exports.setPostId = (req, res, next) => {
  if (!req.body.post) req.body.post = req.params.postId;
  next();
};

exports.getAllResponses = factory.getAll(Response);
exports.getResponse = factory.getOne(Response);
exports.createResponse = factory.createOne(Response);
exports.updateResponse = factory.updateOne(Response);
exports.deleteResponse = factory.deleteOne(Response);
