import jwt from "jsonwebtoken"
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication token required"
            });
        }

      
        const token = authHeader.split(" ")[1];

       
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Retrieving current user and role
        const user = await User.findById(
            decoded.userId
        ).populate("role");

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // Checking account status
        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account is deactivated"
            });
        }

        // Checking assigned role
        if (!user.role) {
            return res.status(403).json({
                message: "No valid role assigned"
            });
        }

        // Attaching user to request
        req.user = user;

        
        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired"
            });
        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        console.error(error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};