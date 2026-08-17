const express = require("express");

const {
    createClaim,
    getMyItemClaims,
    updateClaimStatus
} = require("../controllers/claimController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Claim Request
router.post("/", protect, createClaim);

// Get claims for my items
router.get("/my-items", protect, getMyItemClaims);

router.patch(
    "/:id",
    protect,
    updateClaimStatus
);

module.exports = router;