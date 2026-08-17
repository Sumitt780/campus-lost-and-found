const admin = (req, res, next) => {

    // Check if logged-in user is admin
    if (req.user && req.user.role === "admin") {
        next();
        return;
    }

    // Non-admin user
    return res.status(403).json({
        message: "Admin access required"
    });
};

module.exports = admin;