
class ServerError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode;
    }
}


function handle_error(error, req, res, next) {    
    if (error instanceof ServerError) {
        res.status(error.statusCode).json({
            message: error.message
        });
    } else {
        res.status(500).json({
            message: error.message
        });
    }
}

 module.exports = { handle_error, ServerError }
