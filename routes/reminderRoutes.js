const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const reminderController = require('../controllers/reminderController');

router.use(authController.protect);
router
  .route('/')
  .get(
    authController.setUserId,
    reminderController.getAllReminders
  )
  .post(
    authController.setUserId,
    reminderController.createReminder
  );

router
  .route('/:id')
  .get(reminderController.getReminder)
  .patch(reminderController.updateReminder)
  .delete(reminderController.deleteReminder);

module.exports = router;
