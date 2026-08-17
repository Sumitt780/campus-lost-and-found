const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        // User who should receive the notification
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // User who triggered the notification
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Notification type
        type: {
            type: String,
            enum: [
                "CLAIM_RECEIVED",
                "CLAIM_APPROVED",
                "CLAIM_REJECTED",
                "ITEM_RETURNED",
                "ITEM_RESOLVED"
            ],
            required: true
        },

        // Notification message
        message: {
            type: String,
            required: true,
            trim: true
        },

        // Related item
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            default: null
        },

        // Related claim
        claim: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Claim",
            default: null
        },

        // Read / unread
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Notification",
        notificationSchema
    );