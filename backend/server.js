const claimRoutes = require("./routes/claimRoutes");
const itemRoutes = require("./routes/itemRoutes");
const notificationRoutes =
    require("./routes/notificationRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use(
    "/api/notifications",
    notificationRoutes
);

// Public test route
app.get("/", (req, res) => {
    res.json({
        message: "Campus Lost & Found API is running 🚀"
    });
});

// Protected test route
app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route 🔐",
        user: req.user
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});