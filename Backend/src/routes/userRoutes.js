import express from "express";

import {
    getUsers,
    getUserById,
    getAvailableRoles,
    getRoleFilters,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser
} from "../controllers/userController.js";

import {
    authenticate
} from "../middleware/authMiddleware.js";

import {
    authorize
} from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Get available roles
router.get(
    "/available-roles",
    authenticate,
    getAvailableRoles
);

// View all users
router.get(
    "/",
    authenticate,
    authorize("userManagement", "view"),
    getUsers
);

// View specific user
router.get(
    "/:id",
    authenticate,
    authorize("userManagement", "view"),
    getUserById
);

// Create user
router.post(
    "/",
    authenticate,
    authorize("userManagement", "create"),
    createUser
);

// Update user
router.put(
    "/:id",
    authenticate,
    authorize("userManagement", "edit"),
    updateUser
);

// Activate or deactivate user
router.patch(
    "/:id/status",
    authenticate,
    authorize("userManagement", "edit"),
    updateUserStatus
);

// Delete user
router.delete(
    "/:id",
    authenticate,
    authorize("userManagement", "delete"),
    deleteUser
);


router.get(
    "/role-filters",
    authenticate,
    authorize("userManagement", "view"),
    getRoleFilters
);



export default router;