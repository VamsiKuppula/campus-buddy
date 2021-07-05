const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const scheduleController = require('../controllers/scheduleController');

router.use(authController.protect);
router
  .route('/')
  .get(scheduleController.getAllSchedules)
  .post(
    authController.restrictTo('admin', 'hod', 'cr'),
    scheduleController.createSchedule
  );

router
  .route('/:id')
  .get(scheduleController.getSchedule)
  .patch(
    authController.restrictTo('admin', 'hod', 'cr'),
    scheduleController.updateSchedule
  )
  .delete(
    authController.restrictTo('admin', 'hod', 'cr'),
    scheduleController.deleteSchedule
  );

module.exports = router;
