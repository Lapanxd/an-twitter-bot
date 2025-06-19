import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.colorize(),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `${timestamp} [${level}]: ${message} - ${stack}`
        : `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [
    new transports.Console(),
  ],
});

export default logger;
