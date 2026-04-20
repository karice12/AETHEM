import { Request, Response, NextFunction } from 'express';

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err); // Log the error for debugging

    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message,
        // Optionally include stack trace in dev mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
