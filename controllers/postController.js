const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllPosts = factory.getAll(Post);
exports.createPost = factory.createOne(Post);
exports.getPost = factory.getOne(Post, {
  path: 'responses',
  foreignField: 'post',
  localField: '_id',
});
exports.updatePost = factory.updateOne(Post);

exports.deletePost = factory.deleteOne(Post);

exports.getPostStats = catchAsync(
  async (req, res, next) => {
    const stats = await Post.aggregate([
      {
        $group: {
          _id: '$category',
          numPosts: { $sum: 1 },
        },
      },
      /*
      {
        $group: {
          _id: '$year',
          // {
          //$concat: ['$year', '$_id'],

          //},
          numPosts: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$section', //{
          //$concat: ['$section', '$_id'],
          //},
          numPosts: { $sum: 1 },
        },
      },
      */
    ]);

    res.status(200).json({
      message: 'success',
      data: {
        stats,
      },
    });
  }
);
