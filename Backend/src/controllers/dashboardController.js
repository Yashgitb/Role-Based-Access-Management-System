import User from "../models/User.js";
import Role from "../models/Role.js";

export const getDashboardStats = async (req, res, next) => {
    try {
        const [totalUsers, totalRoles, activeUsers, inactiveUsers] = await Promise.all([
            User.countDocuments(),
            Role.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isActive: false })
        ]);

        return res.status(200).json({
            message: "Dashboard statistics retrieved successfully",
            totalUsers,
            totalRoles,
            activeUsers,
            inactiveUsers
        });
    } catch (error) {
        return next(error);
    }
};

