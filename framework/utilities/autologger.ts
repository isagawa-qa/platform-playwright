/**
 * Autologger - Logging decorator for test automation framework.
 *
 * Provides automatic logging of method entry/exit with timing information.
 * Compatible with TC39 stage 3 decorators (used by Playwright's transpiler).
 *
 * Usage:
 *   class MyTask {
 *     @autologger('Task')
 *     async doSomething() { ... }
 *   }
 */

import { getLogger, Logger } from './logger';

let sharedLogger: Logger | null = null;

export function initLogger(logger: Logger): void {
  sharedLogger = logger;
}

/**
 * Method decorator that logs entry, exit, and timing for async methods.
 * Supports both TC39 decorators and legacy TypeScript decorators.
 *
 * @param category - Category label for log messages (e.g., "Test", "Role", "Task")
 */
export function autologger(category: string) {
  return function (
    target: any,
    contextOrPropertyKey?: any,
    descriptor?: PropertyDescriptor,
  ): any {
    // TC39 stage 3 decorator: (method, context)
    if (typeof target === 'function' && contextOrPropertyKey?.kind === 'method') {
      const originalMethod = target;
      const funcName = String(contextOrPropertyKey.name);

      return async function (this: any, ...args: any[]) {
        const log = sharedLogger ?? getLogger('autologger');
        const prefix = category ? `[${category}] ` : '';

        log.info(`${prefix}${funcName} - START`);
        const startTime = Date.now();

        try {
          const result = await originalMethod.apply(this, args);
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          log.info(`${prefix}${funcName} - END (${duration}s)`);
          return result;
        } catch (error) {
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          log.error(`${prefix}${funcName} - FAILED (${duration}s): ${error}`);
          throw error;
        }
      };
    }

    // Legacy TypeScript decorator: (target, propertyKey, descriptor)
    if (descriptor && typeof descriptor.value === 'function') {
      const originalMethod = descriptor.value;
      const funcName = contextOrPropertyKey as string;

      descriptor.value = async function (...args: unknown[]) {
        const log = sharedLogger ?? getLogger('autologger');
        const prefix = category ? `[${category}] ` : '';

        log.info(`${prefix}${funcName} - START`);
        const startTime = Date.now();

        try {
          const result = await originalMethod.apply(this, args);
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          log.info(`${prefix}${funcName} - END (${duration}s)`);
          return result;
        } catch (error) {
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          log.error(`${prefix}${funcName} - FAILED (${duration}s): ${error}`);
          throw error;
        }
      };

      return descriptor;
    }

    return target;
  };
}
