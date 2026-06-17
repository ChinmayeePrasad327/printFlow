const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const loadUser = require('../middleware/loadUser');
const { listNotifications, markAsRead, markAllAsRead, clearAllNotifications } = require('../controllers/notificationController');

router.get('/', requireAuth(), loadUser, listNotifications);
router.patch('/read-all', requireAuth(), loadUser, markAllAsRead);
router.delete('/', requireAuth(), loadUser, clearAllNotifications);
router.post('/:id/read', requireAuth(), loadUser, markAsRead);

module.exports = router;