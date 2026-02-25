/**
 * Logger utility for the test automation framework.
 *
 * Provides file + console logging with configurable levels.
 */

import * as winston from 'winston';
import * as path from 'node:path';
import * as fs from 'node:fs';

export class Logger {
  private readonly winstonLogger: winston.Logger;

  constructor(name: string, logDir: string = 'logs', logLevel: string = 'info') {
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const logFilePath = path.join(logDir, `test_automation_${timestamp}.log`);

    this.winstonLogger = winston.createLogger({
      level: logLevel,
      defaultMeta: { service: name },
      transports: [
        new winston.transports.File({
          filename: logFilePath,
          level: 'debug',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, service, message }) =>
              `${timestamp} [${level.toUpperCase()}] [${service}] ${message}`
            ),
          ),
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message }) =>
              `${timestamp} [${level.toUpperCase()}] ${message}`
            ),
          ),
        }),
      ],
    });
  }

  debug(message: string): void {
    this.winstonLogger.debug(message);
  }

  info(message: string): void {
    this.winstonLogger.info(message);
  }

  warn(message: string): void {
    this.winstonLogger.warn(message);
  }

  error(message: string): void {
    this.winstonLogger.error(message);
  }
}

export function getLogger(name: string, logDir?: string, logLevel?: string): Logger {
  return new Logger(name, logDir, logLevel);
}
