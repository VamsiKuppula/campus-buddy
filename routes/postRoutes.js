const express = require('express');

const router = express.Router();

const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    postController.getAllPosts
  )
  .post(postController.createPost);

router
  .route('/post-stats')
  .get(postController.getPostStats);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

module.exports = router;
