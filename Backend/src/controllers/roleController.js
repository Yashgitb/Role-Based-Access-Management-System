import mongoose  from "mongoose"
import User from "../models/User.js"
import Role from "../models/Role.js"

const modules = [
    "dashboard",
    "userManagement",
    "roleManagement",
    "reports",
    "settings",
    "myProfile"
];

const actions = [
    "view",
    "create",
    "edit",
    "delete"
];

const defaultRoles = ["Admin", "Manager", "Employee"];

// Validate incoming permissions
const validatePermissions = (permissions) => {

    if (
        !permissions ||
        typeof permissions !== "object" ||
        Array.isArray(permissions)
    ) {
        return false;
    }

    for (const module of Object.keys(permissions)) {

        if (!modules.includes(module)) {
            return false;
        }

        const modulePermissions = permissions[module];

        if (
            !modulePermissions ||
            typeof modulePermissions !== "object" ||
            Array.isArray(modulePermissions)
        ) {
            return false;
        }

        for (const action of Object.keys(modulePermissions)) {

            if (!actions.includes(action)) {
                return false;
            }

            if (typeof modulePermissions[action] !== "boolean") {
                return false;
            }
        }
    }

    return true;
};

// Checking whether a user possesses all the granted permissions
const canManagePermissions = (userPermissions, targetPermissions) => {

    return modules.every(module =>
        actions.every(action =>
            targetPermissions?.[module]?.[action] !== true ||
            userPermissions?.[module]?.[action] === true
        )
    );
};

// Handle controller errors
const handleError = (res, error) => {

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Role name already exists"
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

export const getRoles = async (req, res) => {

    try {

        const roles = await Role.find().sort({ name: 1 });

        return res.status(200).json({
            message: "Roles retrieved successfully",
            totalRoles: roles.length,
            roles
        });

    } catch (error) {
        return handleError(res, error);
    }
};

export const getRoleById = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid role ID"
            });
        }

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        return res.status(200).json({ role });

    } catch (error) {
        return handleError(res, error);
    }
};


export const createRole = async (req, res) => {

    try {

        const { name, permissions = {} } = req.body ?? {};

        // Validate role name
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Role name is required"
            });
        }

        // Validate permissions
        if (!validatePermissions(permissions)) {
            return res.status(400).json({
                message: "Invalid permissions"
            });
        }

        // Check for duplicate role
        const existingRole = await Role.findOne({
            name: name.trim()
        }).collation({ locale: "en", strength: 2 });

        if (existingRole) {
            return res.status(409).json({
                message: "Role already exists"
            });
        }

        // Construct role with schema defaults
        const role = new Role({
            name: name.trim(),
            permissions
        });

        // Prevent unsupported profile operations
        role.permissions.myProfile.create = false;
        role.permissions.myProfile.delete = false;

        // Prevent unsupported dashboard operations
        role.permissions.dashboard.create = false;
        role.permissions.dashboard.edit = false;
        role.permissions.dashboard.delete = false;

        // Prevent privilege escalation for non-Admin role managers
        if (
            req.user.role.name !== "Admin" &&
            !canManagePermissions(
                req.user.role.permissions,
                role.permissions
            )
        ) {
            return res.status(403).json({
                message: "Cannot grant permissions you do not possess"
            });
        }

        await role.save();

        return res.status(201).json({
            message: "Role created successfully",
            role
        });

    } catch (error) {
        return handleError(res, error);
    }
};

export const updateRole = async (req, res) => {

    try {

        const { id } = req.params;
        const { name, permissions } = req.body ?? {};

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid role ID"
            });
        }

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        // Protect Admin role from delegated role managers
        if (
            role.name === "Admin" &&
            req.user.role.name !== "Admin"
        ) {
            return res.status(403).json({
                message: "Cannot modify the Admin role"
            });
        }

        // Prevent unauthorized modification of powerful roles by non-Admin users
        if (
            req.user.role.name !== "Admin" &&
            !canManagePermissions(
                req.user.role.permissions,
                role.permissions
            )
        ) {
            return res.status(403).json({
                message: "Cannot modify a role with higher permissions"
            });
        }

        // Update role name
        if (name !== undefined) {

            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Invalid role name"
                });
            }

            if (
                defaultRoles.includes(role.name) &&
                name.trim() !== role.name
            ) {
                return res.status(400).json({
                    message: "Default roles cannot be renamed"
                });
            }

            const existingRole = await Role.findOne({
                name: name.trim(),
                _id: { $ne: id }
            }).collation({ locale: "en", strength: 2 });

            if (existingRole) {
                return res.status(409).json({
                    message: "Role name already exists"
                });
            }

            role.name = name.trim();
        }

        // Update permissions
        if (permissions !== undefined) {

            if (!validatePermissions(permissions)) {
                return res.status(400).json({
                    message: "Invalid permissions"
                });
            }

            for (const module of Object.keys(permissions)) {

                for (const action of Object.keys(permissions[module])) {

                    role.set(
                        `permissions.${module}.${action}`,
                        permissions[module][action]
                    );
                }
            }
        }

        // Prevent unsupported operations
        role.permissions.myProfile.create = false;
        role.permissions.myProfile.delete = false;

        role.permissions.dashboard.create = false;
        role.permissions.dashboard.edit = false;
        role.permissions.dashboard.delete = false;

        // Prevent privilege escalation for non-Admin role managers
        if (
            req.user.role.name !== "Admin" &&
            !canManagePermissions(
                req.user.role.permissions,
                role.permissions
            )
        ) {
            return res.status(403).json({
                message: "Cannot grant permissions you do not possess"
            });
        }

        // Prevent administrative lockout
        if (role.name === "Admin") {

            const p = role.permissions;

            if (
                !p.roleManagement.view ||
                !p.roleManagement.edit ||
                !p.userManagement.view ||
                !p.userManagement.create ||
                !p.userManagement.edit
            ) {
                return res.status(400).json({
                    message: "Essential Admin permissions cannot be removed"
                });
            }
        }

        await role.save();

        return res.status(200).json({
            message: "Role updated successfully",
            role
        });

    } catch (error) {
        return handleError(res, error);
    }
};

export const deleteRole = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid role ID"
            });
        }

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        // Prevent deletion of default roles
        if (defaultRoles.includes(role.name)) {
            return res.status(400).json({
                message: "Default roles cannot be deleted"
            });
        }

        // Prevent deletion of higher-privileged roles by non-Admin users
        if (
            req.user.role.name !== "Admin" &&
            !canManagePermissions(
                req.user.role.permissions,
                role.permissions
            )
        ) {
            return res.status(403).json({
                message: "Cannot delete a role with higher permissions"
            });
        }

        // Check whether role is assigned to any user
        const assignedUser = await User.exists({
            role: id
        });

        if (assignedUser) {
            return res.status(400).json({
                message: "Cannot delete role assigned to existing users"
            });
        }

        await Role.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Role deleted successfully"
        });

    }catch (error) {
        return handleError(res, error);
    }
};