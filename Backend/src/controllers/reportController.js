import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";

const buildRoleReports = async (roleFilterId = "") => {
    const matchStage = roleFilterId
        ? { role: new mongoose.Types.ObjectId(roleFilterId) }
        : {};

    const [roles, aggregatedCounts] = await Promise.all([
        Role.find(roleFilterId ? { _id: roleFilterId } : {})
            .select("name")
            .sort({ name: 1 })
            .lean(),
        User.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$role",
                    totalUsers: { $sum: 1 },
                    activeUsers: {
                        $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                    },
                    inactiveUsers: {
                        $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
                    }
                }
            }
        ])
    ]);

    const countsMap = new Map(
        aggregatedCounts.map((item) => [String(item._id), item])
    );

    return roles.map((roleDoc) => {
        const stats = countsMap.get(String(roleDoc._id));
        return {
            _id: roleDoc._id,
            roleName: roleDoc.name,
            totalUsers: stats?.totalUsers ?? 0,
            activeUsers: stats?.activeUsers ?? 0,
            inactiveUsers: stats?.inactiveUsers ?? 0
        };
    });
};

export const getReports = async (req, res, next) => {
    try {
        const { role = "" } = req.query;

        if (typeof role !== "string") {
            return res.status(400).json({
                message: "Invalid role filter"
            });
        }

        if (role && !mongoose.isObjectIdOrHexString(role)) {
            return res.status(400).json({
                message: "Invalid role ID"
            });
        }

        const roleReports = await buildRoleReports(role);

        const summary = roleReports.reduce(
            (acc, item) => ({
                totalRoles: acc.totalRoles + 1,
                totalUsers: acc.totalUsers + item.totalUsers,
                activeUsers: acc.activeUsers + item.activeUsers,
                inactiveUsers: acc.inactiveUsers + item.inactiveUsers
            }),
            { totalRoles: 0, totalUsers: 0, activeUsers: 0, inactiveUsers: 0 }
        );

        return res.status(200).json({
            message: "Reports retrieved successfully",
            summary,
            roleReports
        });
    } catch (error) {
        return next(error);
    }
};

export const getRoleReports = async (req, res, next) => {
    try {
        const { role = "" } = req.query;

        if (typeof role !== "string") {
            return res.status(400).json({
                message: "Invalid role filter"
            });
        }

        if (role && !mongoose.isObjectIdOrHexString(role)) {
            return res.status(400).json({
                message: "Invalid role ID"
            });
        }

        const roles = await buildRoleReports(role);

        return res.status(200).json({
            message: "Role statistics retrieved successfully",
            roles
        });
    } catch (error) {
        return next(error);
    }
};

