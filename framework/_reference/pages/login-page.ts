/**
 * LoginPage - Page Object Model
 *
 * Page Object representing the SauceDemo login page.
 * Provides atomic UI interactions via BrowserInterface composition.
 *
 * Rules:
 * - NO decorators
 * - Locators as static class constants
 * - Atomic methods (one UI action)
 * - Return this for chaining
 * - State-check methods for assertions
 */

import { BrowserInterface } from '../../interfaces/browser-interface';

export class LoginPage {
  constructor(private readonly browser: BrowserInterface) {}

  // ==================== LOCATORS (Class Constants) ====================
  static readonly USERNAME_INPUT = '#user-name';
  static readonly PASSWORD_INPUT = '#password';
  static readonly LOGIN_BUTTON = '#login-button';
  static readonly ERROR_MESSAGE = '[data-test="error"]';

  // ==================== NAVIGATION ====================

  async navigate(): Promise<LoginPage> {
    await this.browser.navigateTo(this.browser.config.baseURL);
    return this;
  }

  // ==================== ATOMIC METHODS (One UI Action) ====================

  async enterUsername(username: string): Promise<LoginPage> {
    await this.browser.fill(LoginPage.USERNAME_INPUT, username);
    return this;
  }

  async enterPassword(password: string): Promise<LoginPage> {
    await this.browser.fill(LoginPage.PASSWORD_INPUT, password);
    return this;
  }

  async clickLogin(): Promise<LoginPage> {
    await this.browser.click(LoginPage.LOGIN_BUTTON);
    return this;
  }

  // ==================== STATE-CHECK METHODS (For Assertions) ====================

  async isErrorDisplayed(): Promise<boolean> {
    return await this.browser.isElementVisible(LoginPage.ERROR_MESSAGE, 3000);
  }

  async getErrorText(): Promise<string> {
    return await this.browser.getText(LoginPage.ERROR_MESSAGE);
  }

  async isLoginFormVisible(): Promise<boolean> {
    return await this.browser.isElementVisible(LoginPage.LOGIN_BUTTON, 5000);
  }
}
