const formatSettings = (preferences = {}) => ({
    compactLayout: Boolean(preferences.compactLayout),
    showWelcomeMessage: preferences.showWelcomeMessage ?? true
});

export const getSettings = async (req, res, next) => {
    try {
        return res.status(200).json({
            message: "Settings retrieved successfully",
            settings: formatSettings(req.user.preferences)
        });
    } catch (error) {
        return next(error);
    }
};

export const updateSettings = async (req, res, next) => {
    try {
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return res.status(400).json({
                message: "Invalid settings request body"
            });
        }

        const allowedKeys = ["compactLayout", "showWelcomeMessage"];
        const bodyKeys = Object.keys(body);

        if (bodyKeys.length === 0) {
            return res.status(400).json({
                message: "At least one setting field is required"
            });
        }

        const invalidKeys = bodyKeys.filter((key) => !allowedKeys.includes(key));
        if (invalidKeys.length > 0) {
            return res.status(400).json({
                message: `Unknown settings field: ${invalidKeys.join(", ")}`
            });
        }

        const { compactLayout, showWelcomeMessage } = body;

        if (compactLayout !== undefined && typeof compactLayout !== "boolean") {
            return res.status(400).json({
                message: "compactLayout must be a Boolean"
            });
        }

        if (showWelcomeMessage !== undefined && typeof showWelcomeMessage !== "boolean") {
            return res.status(400).json({
                message: "showWelcomeMessage must be a Boolean"
            });
        }

        req.user.preferences = {
            compactLayout: compactLayout !== undefined
                ? compactLayout
                : Boolean(req.user.preferences?.compactLayout),
            showWelcomeMessage: showWelcomeMessage !== undefined
                ? showWelcomeMessage
                : (req.user.preferences?.showWelcomeMessage ?? true)
        };

        await req.user.save();

        return res.status(200).json({
            message: "Settings updated successfully",
            settings: formatSettings(req.user.preferences)
        });
    } catch (error) {
        return next(error);
    }
};

