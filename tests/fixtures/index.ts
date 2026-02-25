/**
 * Playwright test fixtures - wires BrowserInterface into test lifecycle.
 *
 * Equivalent to Python conftest.py:
 * - browser fixture wrapping BrowserInterface
 * - config fixture from .env
 * - test data fixtures
 */

import { test as base } from '@playwright/test';
import { BrowserInterface, BrowserConfig } from '../../framework/interfaces/browser-interface';
import { Logger } from '../../framework/utilities/logger';
import { DataGenerator } from '../../framework/utilities/data-generator';

type Fixtures = {
  browser_interface: BrowserInterface;
  dataGenerator: DataGenerator;
};

export const test = base.extend<Fixtures>({
  browser_interface: async ({ page }, use) => {
    const config: BrowserConfig = {
      baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
      explicitWait: 20000,
      screenshotDir: 'screenshots',
      screenshotsOnFailure: true,
    };

    const logger = new Logger('BrowserInterface');
    const browserInterface = new BrowserInterface(page, config, logger);

    await use(browserInterface);
  },

  dataGenerator: async ({}, use) => {
    const generator = new DataGenerator('en', 'tests/data');
    await use(generator);
  },
});

export { expect } from '@playwright/test';
