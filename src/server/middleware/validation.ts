// Input validation middleware

import { Request, Response, NextFunction } from 'express';

const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Perform input validation here
    next();
};

export default validationMiddleware;