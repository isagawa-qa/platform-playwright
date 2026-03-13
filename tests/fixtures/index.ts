/**
 * Playwright test fixtures - wires BrowserInterface and ApiClient into test lifecycle.
 *
 * Equivalent to Python conftest.py:
 * - browser_interface fixture wrapping BrowserInterface (UI tests)
 * - api_client fixture wrapping ApiClient (API tests)
 * - Both available for hybrid tests
 * - config fixture from .env
 * - test data fixtures
 */

import { test as base } from '@playwright/test';
import { BrowserInterface, BrowserConfig } from '../../framework/interfaces/browser-interface';
import { ApiClient, ApiConfig } from '../../framework/interfaces/api-client';
import { Logger } from '../../framework/utilities/logger';
import { DataGenerator } from '../../framework/utilities/data-generator';

type Fixtures = {
  browser_interface: BrowserInterface;
  api_client: ApiClient;
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

  api_client: async ({ playwright }, use) => {
    const config: ApiConfig = {
      baseURL: process.env.API_BASE_URL || process.env.BASE_URL || 'https://www.saucedemo.com',
      defaultTimeout: 30000,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const requestContext = await playwright.request.newContext({
      baseURL: config.baseURL,
      extraHTTPHeaders: config.defaultHeaders,
    });

    const logger = new Logger('ApiClient');
    const apiClient = new ApiClient(requestContext, config, logger);

    await use(apiClient);

    await requestContext.dispose();
  },

  dataGenerator: async ({}, use) => {
    const generator = new DataGenerator('en', 'tests/data');
    await use(generator);
  },
});

export { expect } from '@playwright/test';
