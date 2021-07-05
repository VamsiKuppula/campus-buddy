const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const announcementController = require('../controllers/announcementController');

router.use(authController.protect);
router
  .route('/')
  .get(announcementController.getAllAnnouncements)
  .post(
    authController.restrictTo('admin', 'hod'),
    authController.setUserId,
    announcementController.createAnnouncement
  );

router
  .route('/:id')
  .get(announcementController.getAnnouncement)
  .patch(
    authController.restrictTo('admin', 'hod'),
    announcementController.updateAnnouncement
  )
  .delete(
    authController.restrictTo('admin', 'hod'),
    announcementController.deleteAnnouncement
  );

module.exports = router;
