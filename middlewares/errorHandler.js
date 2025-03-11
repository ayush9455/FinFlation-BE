const { constants } = require('../constants')
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        // If headers are already sent, delegate to the default error handler
        return next(err);
    }
    const statusCode = res.statusCode ? res.statusCode : 500;
    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            res.status(statusCode).json({
                error: true,
                title: "Validation Failed",
                message: err.message,
                stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
            });
            break;
        case constants.NOT_FOUND:
            res.status(statusCode).json({
                error: true,
                title: "Not Found",
                message: err.message,
                stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
            });
            break;
        case constants.UNATHORIZED:
            res.status(statusCode).json({
                error: true,
                title: "Unautorized Request",
                message: err.message,
                stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
            });
            break;
        case constants.FORBIDDEN:
            res.status(statusCode).json({
                error: true,
                title: "Forbidden Request",
                message: err.message,
                stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
            });
            break;
        case constants.SERVER_ERROR:
            res.status(statusCode).json({
                error: true,
                title: "Server Error",
                message: err.message,
                stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
            });
            break;
        default:
            console.log("No Error");
    }
    if (res.headersSent) {
        // If headers are already sent, delegate to the default error handler
        return next(err);
    }
    res.status(statusCode).json({
        error: true,
        title: "Not Found",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
    });

}
module.exports = errorHandler;