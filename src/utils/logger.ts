import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.colorize(),
    format.printf(({ timestamp, level, message, stack }) => {
      if (stack && typeof stack === 'string') {
        return `${timestamp} [${level}]: ${stack}`;
      }
      const msg = String(message);
      return `${timestamp} [${level}]: ${msg}`;
    }),
  ),
  transports: [new transports.Console()],
});

export default logger;
