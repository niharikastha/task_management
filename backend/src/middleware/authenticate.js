const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({
            success: false,
            message: "Missing Authorization header.",
        });
    }

    var parts = req.headers.authorization.split(" ");
    if (parts.length != 2) {
        return res.status(401).json({
            message: "Format is Authorization: Bearer [token]",
        });
    }

    const token = req.header("Authorization")?.replace("Bearer ", "");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid Authorization token." });
    }
};

module.exports = authenticate;
