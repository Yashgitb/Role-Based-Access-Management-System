import express from "express";

import {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} from "../controllers/roleController.js";

import {
    authenticate
} from "../middleware/authMiddleware.js";

import {
    authorize
} from "../middleware/permissionMiddleware.js";

const router = express.Router();

// View all roles
router.get(
    "/",
    authenticate,
    authorize("roleManagement", "view"),
    getRoles
);

// View specific role
router.get(
    "/:id",
    authenticate,
    authorize("roleManagement", "view"),
    getRoleById
);

// Create role
router.post(
    "/",
    authenticate,
    authorize("roleManagement", "create"),
    createRole
);

// Update role
router.put(
    "/:id",
    authenticate,
    authorize("roleManagement", "edit"),
    updateRole
);

// Delete role
router.delete(
    "/:id",
    authenticate,
    authorize("roleManagement", "delete"),
    deleteRole
);

export default router;