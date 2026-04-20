import rateLimit from 'express-rate-limit';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Auth limiter
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.'
});

// Payment limiter
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 payment requests per windowMs
  message: 'Too many payment attempts from this IP, please try again later.'
});

export { apiLimiter, authLimiter, paymentLimiter };