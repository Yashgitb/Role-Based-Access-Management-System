export const authorize = (module, action) => {

    return (req, res, next) => {

        const permissions = req.user?.role?.permissions;

        if (permissions?.[module]?.[action] !== true) {
            return res.status(403).json({
                message: "Access denied. Insufficient permissions."
            });
        }

        next();
    };
};