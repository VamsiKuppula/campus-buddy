const express = require('express');

const router = express.Router();

const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const responseRouter = require('./responseRoutes');

router.use('/:postId/responses', responseRouter);
router.use(authController.protect);

router
  .route('/')
  .get(postController.getAllPosts)
  .post(
    authController.setUserId,
    postController.createPost
  );

router
  .route('/post-stats')
  .get(postController.getPostStats);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

module.exports = router;
