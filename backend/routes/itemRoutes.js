const express = require("express");

const router = express.Router();


// ==================== CONTROLLER ====================

const {
    createItem,
    getItems,
    getItemById,
    getMyItems,
    updateItem,
    deleteItem,
    updateItemStatus
} = require("../controllers/itemController");


// ==================== MIDDLEWARE ====================

const protect =
    require("../middleware/authMiddleware");

const upload =
    require("../middleware/uploadMiddleware");

const admin = 
    require("../middleware/adminMiddleware");


// ==========================================================
//                     CREATE ITEM
// ==========================================================
// IMPORTANT:
// upload.single("image") must come BEFORE createItem
// because frontend is sending multipart/form-data.

router.post(
    "/",
    protect,
    upload.single("image"),
    createItem
);


// ==========================================================
//                     GET ALL ITEMS
// ==========================================================

router.get(
    "/",
    getItems
);


// ==========================================================
//                     GET MY ITEMS
// ==========================================================
// IMPORTANT:
// This must come BEFORE /:id

router.get(
    "/my-items",
    protect,
    getMyItems
);

// ==================== UPDATE ITEM STATUS ====================

router.patch(
    "/:id/status",
    protect,
    updateItemStatus
);

// ==================== ADMIN DELETE ITEM ====================

router.delete(
    "/admin/:id",
    protect,
    admin,
    deleteItem
);

// ==========================================================
//                     UPDATE ITEM
// ==========================================================

router.patch(
    "/:id",
    protect,
    updateItem
);


// ==========================================================
//                     DELETE ITEM
// ==========================================================

router.delete(
    "/:id",
    protect,
    deleteItem
);


// ==========================================================
//                     GET SINGLE ITEM
// ==========================================================

router.get(
    "/:id",
    getItemById
);


module.exports = router;