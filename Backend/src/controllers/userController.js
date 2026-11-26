import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";

const modules = [
    "dashboard",
    "userManagement",
    "roleManagement",
    "reports",
    "settings",
    "myProfile"
];

const actions = ["view", "create", "edit", "delete"];

// Check whether a role can be assigned by the logged-in user
const canAssignRole = (currentRole, targetRole) => {

    if (!targetRole) return false;

    if (
        targetRole.name === "Admin" &&
        currentRole.name !== "Admin"
    ) {
        return false;
    }

    for (const module of modules) {
        for (const action of actions) {

            if (
                targetRole.permissions?.[module]?.[action] === true &&
                currentRole.permissions?.[module]?.[action] !== true
            ) {
                return false;
            }
        }
    }

    return true;
};

// Common error handling
const handleError = (res, error) => {

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Email already exists"
        });
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({
            message: error.message
        });
    }

    console.error(error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
};

// Check whether a target user can be modified
const canModifyUser = (currentUser, targetUser) => {

    // Protect Admin accounts
    if (targetUser.role?.name === "Admin") {
        return false;
    }

    // Prevent self-modification through User Management
    if (currentUser._id.equals(targetUser._id)) {
        return false;
    }

    return canAssignRole(
        currentUser.role,
        targetUser.role
    );
};

export const getUsers = async (req, res) => {
    try {

        // 1. Get query parameters
        const page = Number(req.query.page ?? 1);
        const limit = 10;

        const { search = "", role = "" } = req.query;

        // 2. Validate page number
        if (!Number.isSafeInteger(page) || page < 1) {
            return res.status(400).json({
                message: "Invalid page number"
            });
        }

        if (
            typeof search !== "string" ||
            typeof role !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid filter"
            });
        }

        // 3. Create filter object
        const filter = {};

        // 4. Search by name or email
        if (search.trim()) {

            const safeSearch = search.trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            filter.$or = [
                {
                    name: {
                        $regex: safeSearch,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: safeSearch,
                        $options: "i"
                    }
                }
            ];
        }

        // 5. Filter by role
        if (role) {

            if (!mongoose.isObjectIdOrHexString(role)) {
                return res.status(400).json({
                    message: "Invalid role ID"
                });
            }

            filter.role = role;
        }

        // 6. Count matching users
        const totalUsers = await User.countDocuments(filter);

        const totalPages = Math.ceil(totalUsers / limit);

        const currentPage = Math.min(
            page,
            Math.max(totalPages, 1)
        );

        // 7. Calculate skip
        const skip = (currentPage - 1) * limit;

        // 8. Retrieve users
        const users = await User.find(filter)
            .select("-password")
            .populate("role", "name")
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit);

        // 9. Send response
        return res.status(200).json({
            users,
            currentPage,
            totalPages,
            totalUsers,
            limit
        });

    } catch (error) {
        return handleError(res, error);
    }
};

export const getUserById = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id)
            .select("-password")
            .populate("role", "name");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({ user });

    } catch (error) {
        return handleError(res, error);
    }
};


export const getAvailableRoles = async (req, res) => {

    try {

        const permissions =
            req.user.role.permissions.userManagement;

        if (!permissions?.create && !permissions?.edit) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const roles = await Role.find().sort({ name: 1 });

        const availableRoles = roles
            .filter(role =>
                canAssignRole(req.user.role, role)
            )
            .map(role => ({
                _id: role._id,
                name: role.name
            }));

        return res.status(200).json({
            roles: availableRoles
        });

    } catch (error) {
        return handleError(res, error);
    }
};

export const createUser = async (req, res) => {

    try {

        const { name, email, password, role } = req.body ?? {};

        // Validate required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !role
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Validate password
        if (
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and at most 72 bytes"
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Validate role ID
        if (!mongoose.isObjectIdOrHexString(role)) {
            return res.status(400).json({
                message: "Invalid role ID"
            });
        }

        // Find the selected role
        const assignedRole = await Role.findById(role);

        if (!assignedRole) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        // Prevent privilege escalation
        if (!canAssignRole(req.user.role, assignedRole)) {
            return res.status(403).json({
                message: "You cannot assign this role"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: assignedRole._id,
            isActive: true
        });

        return res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: {
                    _id: assignedRole._id,
                    name: assignedRole.name
                },
                isActive: user.isActive
            }
        });

    } catch (error) {
        return handleError(res, error);
    }
};

export const updateUser = async (req, res) => {

    try {

        const { id } = req.params;
        const { name, email, role } = req.body ?? {};

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id)
            .populate("role");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!canModifyUser(req.user, user)) {
            return res.status(403).json({
                message: "You cannot modify this user"
            });
        }

        // Update name
        if (name !== undefined) {

            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Invalid name"
                });
            }

            user.name = name;
        }

        // Update email
        if (email !== undefined) {

            if (typeof email !== "string" || !email.trim()) {
                return res.status(400).json({
                    message: "Invalid email"
                });
            }

            user.email = email;
        }

        // Change assigned role
        if (role !== undefined) {

            if (!mongoose.isObjectIdOrHexString(role)) {
                return res.status(400).json({
                    message: "Invalid role ID"
                });
            }

            const newRole = await Role.findById(role);

            if (!newRole) {
                return res.status(404).json({
                    message: "Role not found"
                });
            }

            if (!canAssignRole(req.user.role, newRole)) {
                return res.status(403).json({
                    message: "You cannot assign this role"
                });
            }

            user.role = newRole._id;
        }

        await user.save();

        await user.populate("role", "name");

        return res.status(200).json({
            message: "User updated successfully",
            user
        });

    } catch (error) {
        return handleError(res, error);
    }
};

export const updateUserStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { isActive } = req.body ?? {};

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be a Boolean"
            });
        }

        const user = await User.findById(id)
            .populate("role");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!canModifyUser(req.user, user)) {
            return res.status(403).json({
                message: "You cannot change this user's status"
            });
        }

        user.isActive = isActive;

        await user.save();

        return res.status(200).json({
            message: isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            user
        });

    } catch (error) {
        return handleError(res, error);
    }
};

export const deleteUser = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id)
            .populate("role");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!canModifyUser(req.user, user)) {
            return res.status(403).json({
                message: "You cannot delete this user"
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        return handleError(res, error);
    }
};


export const getRoleFilters = async (req, res) => {
    try {

        const roles = await Role.find()
            .select("name")
            .sort({ name: 1 });

        return res.status(200).json({ roles });

    } catch (error) {
        return handleError(res, error);
    }
};