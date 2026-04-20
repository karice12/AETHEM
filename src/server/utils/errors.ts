class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class AuthenticationError extends AppError {
    constructor(message) {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message) {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

class InternalServerError extends AppError {
    constructor(message) {
        super(message, 500);
    }
}

export { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, InternalServerError };