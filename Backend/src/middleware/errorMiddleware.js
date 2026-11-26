export const notFoundHandler = (req, res) => {
    return res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON request body"
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            message: `Invalid ${err.path || "ID"} format`
        });
    }

    if (err.name === "ValidationError") {
        const message = Object.values(err.errors || {})
            .map((item) => item.message)
            .join(", ");

        return res.status(400).json({
            message: message || err.message
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "Resource";
        const label = field.charAt(0).toUpperCase() + field.slice(1);
        return res.status(409).json({
            message: `${label} already exists`
        });
    }

    if (err.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    console.error(err.message);

    return res.status(500).json({
        message: "Internal server error"
    });
};

