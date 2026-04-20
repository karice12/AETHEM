import { createLogger, transports, format } from 'winston';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        // Add more transports like File or HTTP if needed
    ],
});

export const log = {
    debug: (message: string, meta?: object) => logger.debug(message, meta),
    info: (message: string, meta?: object) => logger.info(message, meta),
    warn: (message: string, meta?: object) => logger.warn(message, meta),
    error: (message: string, meta?: object) => logger.error(message, meta),
};