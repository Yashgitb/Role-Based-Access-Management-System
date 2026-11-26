import bcrypt from "bcryptjs";
import User from "../models/User.js";

const formatProfile = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

export const getMyProfile = async (req, res, next) => {
    try {
        return res.status(200).json({
            message: "Profile retrieved successfully",
            profile: formatProfile(req.user)
        });
    } catch (error) {
        return next(error);
    }
};

export const updateMyProfile = async (req, res, next) => {
    try {
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return res.status(400).json({
                message: "Invalid profile request body"
            });
        }

        if (
            body.role !== undefined ||
            body.permissions !== undefined ||
            body.isActive !== undefined ||
            body.password !== undefined
        ) {
            return res.status(403).json({
                message: "Role, permissions, account status, and password cannot be modified through profile"
            });
        }

        const { name, email } = body;

        if (name === undefined && email === undefined) {
            return res.status(400).json({
                message: "Name or email is required"
            });
        }

        const user = await User.findById(req.user._id).populate("role");

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty"
                });
            }
            user.name = name.trim();
        }

        if (email !== undefined) {
            if (typeof email !== "string" || !email.trim()) {
                return res.status(400).json({
                    message: "Email cannot be empty"
                });
            }
            user.email = email.trim().toLowerCase();
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            profile: formatProfile(user)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }
        return next(error);
    }
};

export const changeMyPassword = async (req, res, next) => {
    try {
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return res.status(400).json({
                message: "Invalid password change request body"
            });
        }

        const { currentPassword, newPassword } = body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        if (
            newPassword.length < 8 ||
            Buffer.byteLength(newPassword, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "New password must be at least 8 characters and at most 72 bytes"
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different from your current password"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully"
        });
    } catch (error) {
        return next(error);
    }
};

