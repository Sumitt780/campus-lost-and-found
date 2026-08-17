const Claim = require("../models/Claim");
const Item = require("../models/Item");
const Notification = require("../models/Notification");


// =====================================================
// CREATE CLAIM
// =====================================================

const createClaim = async (req, res) => {

    try {

        const {
            itemId,
            message
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !itemId ||
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({
                message:
                    "Item ID and claim message are required"
            });
        }


        // =================================================
        // FIND ITEM
        // =================================================

        const item =
            await Item.findById(itemId);


        if (!item) {

            return res.status(404).json({
                message:
                    "Item not found"
            });
        }


        // =================================================
        // USER CANNOT CLAIM OWN ITEM
        // =================================================

        if (
            item.postedBy.toString() ===
            req.user._id.toString()
        ) {

            return res.status(400).json({
                message:
                    "You cannot claim your own item"
            });
        }


        // =================================================
        // ITEM NOT AVAILABLE
        // =================================================

        if (
            item.status === "Claimed" ||
            item.status === "Returned" ||
            item.status === "Resolved"
        ) {

            return res.status(400).json({
                message:
                    "This item is no longer available for claiming"
            });
        }


        // =================================================
        // EXISTING PENDING CLAIM
        // =================================================

        const existingClaim =
            await Claim.findOne({

                item: itemId,

                claimant:
                    req.user._id,

                status:
                    "Pending"
            });


        if (existingClaim) {

            return res.status(400).json({
                message:
                    "You already have a pending claim for this item"
            });
        }


        // =================================================
        // CREATE CLAIM
        // =================================================

        const claim =
            await Claim.create({

                item:
                    itemId,

                claimant:
                    req.user._id,

                message:
                    message.trim(),

                status:
                    "Pending"
            });


        // =================================================
        // UPDATE ITEM STATUS
        // =================================================

        if (
            item.status === "Lost" ||
            item.status === "Found"
        ) {

            item.status =
                "Claim Requested";

            await item.save();
        }


        // =================================================
        // NOTIFICATION → ITEM OWNER
        // =================================================

        await Notification.create({

            recipient:
                item.postedBy,

            sender:
                req.user._id,

            type:
                "CLAIM_RECEIVED",

            message:
                `${req.user.name || "A student"} submitted a claim for your item "${item.title}"`,

            item:
                item._id,

            claim:
                claim._id

        });


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({

            message:
                "Claim request submitted successfully",

            claim

        });


    } catch (error) {

        console.error(
            "Create Claim Error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error while creating claim"

        });
    }
};



// =====================================================
// GET CLAIMS FOR MY ITEMS
// =====================================================

const getMyItemClaims = async (req, res) => {

    try {

        // =================================================
        // GET USER'S ITEMS
        // =================================================

        const myItems =
            await Item.find({
                postedBy:
                    req.user._id
            }).select("_id");


        const itemIds =
            myItems.map(
                item => item._id
            );


        // =================================================
        // GET CLAIMS
        // =================================================

        const claims =
            await Claim.find({

                item: {
                    $in:
                        itemIds
                }

            })
                .populate(
                    "item",
                    "title description type status location date image"
                )
                .populate(
                    "claimant",
                    "name email"
                )
                .sort({
                    createdAt:
                        -1
                });


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            count:
                claims.length,

            claims

        });


    } catch (error) {

        console.error(
            "Get Claims Error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error while fetching claims"

        });
    }
};



// =====================================================
// APPROVE / REJECT CLAIM
// =====================================================

const updateClaimStatus = async (req, res) => {

    try {

        const {
            status
        } = req.body;


        // =================================================
        // ALLOWED STATUSES
        // =================================================

        const allowedStatuses = [
            "Approved",
            "Rejected"
        ];


        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Status must be Approved or Rejected"

            });
        }


        // =================================================
        // FIND CLAIM
        // =================================================

        const claim =
            await Claim.findById(
                req.params.id
            ).populate("item");


        if (!claim) {

            return res.status(404).json({

                message:
                    "Claim not found"

            });
        }


        // =================================================
        // CHECK ITEM
        // =================================================

        if (!claim.item) {

            return res.status(404).json({

                message:
                    "Item associated with claim not found"

            });
        }


        // =================================================
        // ONLY ITEM OWNER CAN MANAGE CLAIM
        // =================================================

        if (
            claim.item.postedBy.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({

                message:
                    "You are not authorized to manage this claim"

            });
        }


        // =================================================
        // CLAIM ALREADY PROCESSED
        // =================================================

        if (
            claim.status !== "Pending"
        ) {

            return res.status(400).json({

                message:
                    "This claim has already been processed"

            });
        }


        // =================================================
        // UPDATE CLAIM STATUS
        // =================================================

        claim.status =
            status;

        await claim.save();


        // =================================================
        // APPROVED
        // =================================================

        if (
            status === "Approved"
        ) {

            claim.item.status =
                "Claimed";

            await claim.item.save();


            // =============================================
            // NOTIFICATION → CLAIMANT
            // =============================================

            await Notification.create({

                recipient:
                    claim.claimant,

                sender:
                    req.user._id,

                type:
                    "CLAIM_APPROVED",

                message:
                    `Your claim for "${claim.item.title}" has been approved.`,

                item:
                    claim.item._id,

                claim:
                    claim._id

            });
        }


        // =================================================
        // REJECTED
        // =================================================

        if (
            status === "Rejected"
        ) {

            // =============================================
            // CHECK REMAINING PENDING CLAIMS
            // =============================================

            const remainingPendingClaims =
                await Claim.countDocuments({

                    item:
                        claim.item._id,

                    status:
                        "Pending"

                });


            // =============================================
            // RESTORE ITEM STATUS
            // =============================================

            if (
                remainingPendingClaims === 0
            ) {

                if (
                    claim.item.type === "Found"
                ) {

                    claim.item.status =
                        "Found";

                } else {

                    claim.item.status =
                        "Lost";
                }


                await claim.item.save();
            }


            // =============================================
            // NOTIFICATION → CLAIMANT
            // =============================================

            await Notification.create({

                recipient:
                    claim.claimant,

                sender:
                    req.user._id,

                type:
                    "CLAIM_REJECTED",

                message:
                    `Your claim for "${claim.item.title}" has been rejected.`,

                item:
                    claim.item._id,

                claim:
                    claim._id

            });
        }


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            message:
                `Claim ${status.toLowerCase()} successfully`,

            claim

        });


    } catch (error) {

        console.error(
            "Update Claim Error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error while updating claim"

        });
    }
};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createClaim,

    getMyItemClaims,

    updateClaimStatus

};