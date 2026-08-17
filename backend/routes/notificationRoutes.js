const express = require("express");

const {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================================
// GET MY NOTIFICATIONS
// ==========================================================

router.get(
    "/",
    protect,
    getMyNotifications
);


// ==========================================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================================

router.patch(
    "/read-all",
    protect,
    markAllNotificationsAsRead
);


// ==========================================================
// MARK ONE NOTIFICATION AS READ
// ==========================================================

router.patch(
    "/:id/read",
    protect,
    markNotificationAsRead
);


// ==========================================================
// DELETE NOTIFICATION
// ==========================================================

router.delete(
    "/:id",
    protect,
    deleteNotification
);


module.exports = router;