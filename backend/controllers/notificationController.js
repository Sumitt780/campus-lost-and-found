const Notification = require("../models/Notification");


// ==========================================================
// GET MY NOTIFICATIONS
// ==========================================================

const getMyNotifications = async (req, res) => {

    try {

        const notifications =
            await Notification.find({
                recipient: req.user._id
            })
                .populate(
                    "sender",
                    "name email"
                )
                .populate(
                    "item",
                    "title type status"
                )
                .populate(
                    "claim",
                    "status message"
                )
                .sort({
                    createdAt: -1
                });


        // Count unread notifications

        const unreadCount =
            await Notification.countDocuments({
                recipient: req.user._id,
                isRead: false
            });


        res.status(200).json({

            count:
                notifications.length,

            unreadCount,

            notifications

        });


    } catch (error) {

        console.error(
            "Get Notifications Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error while fetching notifications"

        });
    }
};



// ==========================================================
// MARK ONE NOTIFICATION AS READ
// ==========================================================

const markNotificationAsRead =
    async (req, res) => {

        try {

            const notification =
                await Notification.findOne({
                    _id: req.params.id,
                    recipient: req.user._id
                });


            if (!notification) {

                return res.status(404).json({

                    message:
                        "Notification not found"

                });
            }


            notification.isRead = true;

            await notification.save();


            res.status(200).json({

                message:
                    "Notification marked as read",

                notification

            });


        } catch (error) {

            console.error(
                "Mark Notification Error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while updating notification"

            });
        }
    };



// ==========================================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================================

const markAllNotificationsAsRead =
    async (req, res) => {

        try {

            await Notification.updateMany(

                {
                    recipient:
                        req.user._id,

                    isRead:
                        false
                },

                {
                    $set: {
                        isRead: true
                    }
                }

            );


            res.status(200).json({

                message:
                    "All notifications marked as read"

            });


        } catch (error) {

            console.error(
                "Mark All Notifications Error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while updating notifications"

            });
        }
    };



// ==========================================================
// DELETE ONE NOTIFICATION
// ==========================================================

const deleteNotification =
    async (req, res) => {

        try {

            const notification =
                await Notification.findOneAndDelete({
                    _id: req.params.id,
                    recipient: req.user._id
                });


            if (!notification) {

                return res.status(404).json({

                    message:
                        "Notification not found"

                });
            }


            res.status(200).json({

                message:
                    "Notification deleted successfully"

            });


        } catch (error) {

            console.error(
                "Delete Notification Error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while deleting notification"

            });
        }
    };



// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getMyNotifications,

    markNotificationAsRead,

    markAllNotificationsAsRead,

    deleteNotification

};