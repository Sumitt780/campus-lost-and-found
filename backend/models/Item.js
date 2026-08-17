const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Electronics",
                "Documents",
                "Clothing",
                "Accessories",
                "Books",
                "Keys",
                "Other"
            ]
        },

        type: {
            type: String,
            required: true,
            enum: ["Lost", "Found"]
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        image: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: [
                     "Lost",
                     "Found",
                     "Claim Requested",
                     "Claimed",
                     "Returned",
                     "Resolved"
            ],
            default: "Lost"
        },

        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Item", itemSchema);