const Item = require("../models/Item");


// ==========================================================
//                     CREATE ITEM
// ==========================================================

const createItem = async (req, res) => {
    try {

        const {
            title,
            description,
            category,
            type,
            location,
            date
        } = req.body;


        // Validate required fields
        if (
            !title ||
            !description ||
            !category ||
            !type ||
            !location ||
            !date
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }


        // Create item
        const item = await Item.create({
            title,
            description,
            category,
            type,
            location,
            date,
            image: req.file
                ? `/uploads/${req.file.filename}`
                : null,
            postedBy: req.user._id
        });


        res.status(201).json({
            message: "Item posted successfully",
            item
        });


    } catch (error) {

        console.error(
            "Create Item Error:",
            error
        );

        res.status(500).json({
            message: "Server error while creating item"
        });

    }
};


// ==========================================================
//                GET ALL ITEMS + SEARCH + FILTER
// ==========================================================

const getItems = async (req, res) => {
    try {

        const {
            search,
            type,
            category,
            location
        } = req.query;


        const filter = {
            status: {
                $ne: "Resolved"
            }
        };


        // Search in title and description
        if (search) {

            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];

        }


        // Filter by Lost / Found
        if (type) {
            filter.type = type;
        }


        // Filter by category
        if (category) {
            filter.category = category;
        }


        // Filter by location
        if (location) {

            filter.location = {
                $regex: location,
                $options: "i"
            };

        }


        const items = await Item.find(filter)
            .populate(
                "postedBy",
                "name email"
            )
            .sort({
                createdAt: -1
            });


        res.status(200).json({
            count: items.length,
            items
        });


    } catch (error) {

        console.error(
            "Get Items Error:",
            error
        );

        res.status(500).json({
            message: "Server error while fetching items"
        });

    }
};


// ==========================================================
//                     GET SINGLE ITEM
// ==========================================================

const getItemById = async (req, res) => {
    try {

        const item =
            await Item.findById(req.params.id)
                .populate(
                    "postedBy",
                    "name email"
                );


        if (!item) {

            return res.status(404).json({
                message: "Item not found"
            });

        }


        res.status(200).json({
            item
        });


    } catch (error) {

        console.error(
            "Get Item Error:",
            error
        );

        res.status(500).json({
            message: "Server error while fetching item"
        });

    }
};


// ==========================================================
//                     GET MY ITEMS
// ==========================================================

const getMyItems = async (req, res) => {
    try {

        const items =
            await Item.find({
                postedBy: req.user._id
            })
                .populate(
                    "postedBy",
                    "name email"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({
            count: items.length,
            items
        });


    } catch (error) {

        console.error(
            "Get My Items Error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while fetching your items"
        });

    }
};

// ==========================================================
// UPDATE ITEM STATUS
// ==========================================================

const updateItemStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const allowedStatuses = [
            "Claimed",
            "Returned",
            "Resolved"
        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                message:
                    "Invalid item status"
            });
        }


        const item =
            await Item.findById(
                req.params.id
            );


        if (!item) {

            return res.status(404).json({
                message:
                    "Item not found"
            });
        }


        // Only item owner can change status
        if (
            item.postedBy.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({
                message:
                    "You can only update your own items"
            });
        }


        // Status flow protection
        if (
            status === "Returned" &&
            item.status !== "Claimed"
        ) {

            return res.status(400).json({
                message:
                    "Only a Claimed item can be marked Returned"
            });
        }


        if (
            status === "Resolved" &&
            item.status !== "Returned"
        ) {

            return res.status(400).json({
                message:
                    "Only a Returned item can be marked Resolved"
            });
        }


        item.status = status;

        await item.save();


        res.status(200).json({
            message:
                `Item marked as ${status}`,
            item
        });


    } catch (error) {

        console.error(
            "Update Item Status Error:",
            error
        );


        res.status(500).json({
            message:
                "Server error while updating item status"
        });
    }
};

// ==========================================================
//                     UPDATE ITEM
// ==========================================================

const updateItem = async (req, res) => {
    try {

        const item =
            await Item.findById(req.params.id);


        if (!item) {

            return res.status(404).json({
                message: "Item not found"
            });

        }


        // Only owner can update
        if (
            item.postedBy.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({
                message:
                    "You can only update your own items"
            });

        }


        const {
            title,
            description,
            category,
            type,
            location,
            date,
            status
        } = req.body;


        // Update only provided fields
        item.title =
            title ?? item.title;

        item.description =
            description ?? item.description;

        item.category =
            category ?? item.category;

        item.type =
            type ?? item.type;

        item.location =
            location ?? item.location;

        item.date =
            date ?? item.date;

        item.status =
            status ?? item.status;


        const updatedItem =
            await item.save();


        res.status(200).json({
            message: "Item updated successfully",
            item: updatedItem
        });


    } catch (error) {

        console.error(
            "Update Item Error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while updating item"
        });

    }
};


// ==========================================================
//                       DELETE ITEM
// ==========================================================

const deleteItem = async (req, res) => {

    try {

        const item =
            await Item.findById(
                req.params.id
            );


        if (!item) {

            return res.status(404).json({
                message: "Item not found"
            });
        }


        // ==================================================
        //              ADMIN / OWNER CHECK
        // ==================================================

        const isAdmin =
            req.user.role === "admin";


        const isOwner =
            item.postedBy.toString() ===
            req.user._id.toString();


        // Admin can delete ANY item
        // Student can delete ONLY own item

        if (!isAdmin && !isOwner) {

            return res.status(403).json({
                message:
                    "You can only delete your own items"
            });
        }


        // ==================================================
        //                     DELETE
        // ==================================================

        await Item.findByIdAndDelete(
            req.params.id
        );


        // ==================================================
        //                    RESPONSE
        // ==================================================

        res.status(200).json({

            message:
                isAdmin
                    ? "Item removed by admin successfully"
                    : "Item deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete Item Error:",
            error
        );


        res.status(500).json({
            message:
                "Server error while deleting item"
        });
    }
};

// ==========================================================
//                     EXPORT CONTROLLERS
// ==========================================================

module.exports = {
    createItem,
    getItems,
    getItemById,
    getMyItems,
    updateItem,
    deleteItem,
    updateItemStatus
};