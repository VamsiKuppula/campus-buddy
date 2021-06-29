const express = require('express');

const router = express.Router({ mergeParams: true });

const responseController = require('../controllers/responseController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router
  .route('/')
  .get(responseController.getAllResponses)
  .post(
    responseController.setPostUserIds,
    responseController.createResponse
  );

router
  .route('/:id')
  .get(responseController.getResponse)
  .patch(responseController.updateResponse)
  .delete(responseController.deleteResponse);

module.exports = router;
