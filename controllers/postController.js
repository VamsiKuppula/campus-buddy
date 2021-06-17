const Post = require('../models/postModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const posts = await features.query;

  res.status(200).json({
    message: 'success',
    requestedAt: req.requestTime,
    results: posts.length,
    data: { posts },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create(req.body);
  res.status(201).json({
    message: 'success',
    data: {
      post: newPost,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new AppError('No post found with that id.', 404)
    );
  }

  res.status(200).json({
    message: 'success',
    data: {
      post,
    },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  if (!post) {
    return next(
      new AppError('No post found with that id.', 404)
    );
  }

  res.status(200).json({
    message: 'success',
    data: {
      post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    return next(
      new AppError('No post found with that id.', 404)
    );
  }

  res.status(204).json({
    message: 'success',
    data: null,
  });
});

exports.getPostStats = catchAsync(
  async (req, res, next) => {
    const stats = await Post.aggregate([
      {
        $group: {
          _id: {
            branch: '$branch',
            year: '$year',
            section: '$section',
          },
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
