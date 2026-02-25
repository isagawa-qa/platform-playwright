/**
 * BrowserInterface - Playwright Page wrapper with enhanced functionality.
 *
 * Provides:
 * - Navigation methods
 * - Element finding with auto-waiting
 * - Interaction methods (click, fill, select, etc.)
 * - Advanced wait conditions
 * - Screenshot capture
 * - JavaScript execution
 * - Frame and window handling
 * - Comprehensive logging
 */

import { Page, Locator, FrameLocator } from '@playwright/test';
import { Logger } from '../utilities/logger';

export interface BrowserConfig {
  baseURL: string;
  explicitWait?: number;
  screenshotDir?: string;
  screenshotsOnFailure?: boolean;
}

export class BrowserInterface {
  readonly page: Page;
  readonly config: BrowserConfig;
  private readonly logger: Logger;
  private readonly explicitWait: number;
  private readonly screenshotDir: string;
  private readonly screenshotsOnFailure: boolean;

  constructor(page: Page, config: BrowserConfig, logger: Logger) {
    this.page = page;
    this.config = config;
    this.logger = logger;
    this.explicitWait = config.explicitWait ?? 20000;
    this.screenshotDir = config.screenshotDir ?? 'screenshots';
    this.screenshotsOnFailure = config.screenshotsOnFailure ?? true;
  }

  // ==================== NAVIGATION METHODS ====================

  async navigateTo(url: string): Promise<void> {
    this.logger.info(`Navigating to: ${url}`);
    try {
      await this.page.goto(url, { timeout: this.explicitWait });
      this.logger.info(`Successfully navigated to: ${url}`);
    } catch (error) {
      this.logger.error(`Failed to navigate to ${url}: ${error}`);
      await this.takeScreenshotOnFailure('navigation_failure');
      throw error;
    }
  }

  async refreshPage(): Promise<void> {
    this.logger.info('Refreshing page');
    await this.page.reload();
  }

  async goBack(): Promise<void> {
    this.logger.info('Navigating back');
    await this.page.goBack();
  }

  async goForward(): Promise<void> {
    this.logger.info('Navigating forward');
    await this.page.goForward();
  }

  getCurrentUrl(): string {
    const url = this.page.url();
    this.logger.debug(`Current URL: ${url}`);
    return url;
  }

  async getPageTitle(): Promise<string> {
    const title = await this.page.title();
    this.logger.debug(`Page title: ${title}`);
    return title;
  }

  // ==================== ELEMENT FINDING METHODS ====================

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async isElementPresent(selector: string, timeout?: number): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({
        state: 'attached',
        timeout: timeout ?? 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  // ==================== INTERACTION METHODS ====================

  async click(selector: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.info(`Clicking element: ${selector}`);
    try {
      await this.page.locator(selector).click({ timeout: t });
      this.logger.info(`Clicked element: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to click element ${selector}: ${error}`);
      await this.takeScreenshotOnFailure('click_failure');
      throw error;
    }
  }

  async fill(selector: string, text: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.info(`Filling text into element: ${selector}`);
    try {
      await this.page.locator(selector).fill(text, { timeout: t });
      this.logger.info(`Filled text into element: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to fill text into ${selector}: ${error}`);
      await this.takeScreenshotOnFailure('fill_failure');
      throw error;
    }
  }

  async selectOption(selector: string, value: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.info(`Selecting option '${value}' from: ${selector}`);
    try {
      await this.page.locator(selector).selectOption({ label: value }, { timeout: t });
      this.logger.info(`Selected option '${value}' from: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to select option: ${error}`);
      await this.takeScreenshotOnFailure('select_failure');
      throw error;
    }
  }

  async selectOptionByValue(selector: string, optionValue: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.info(`Selecting option by value '${optionValue}' from: ${selector}`);
    try {
      await this.page.locator(selector).selectOption({ value: optionValue }, { timeout: t });
      this.logger.info(`Selected option by value '${optionValue}' from: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to select option by value: ${error}`);
      await this.takeScreenshotOnFailure('select_failure');
      throw error;
    }
  }

  async getText(selector: string, timeout?: number): Promise<string> {
    const t = timeout ?? this.explicitWait;
    this.logger.debug(`Getting text from element: ${selector}`);
    try {
      const text = await this.page.locator(selector).innerText({ timeout: t });
      this.logger.debug(`Retrieved text: '${text}' from ${selector}`);
      return text;
    } catch (error) {
      this.logger.error(`Failed to get text from ${selector}: ${error}`);
      await this.takeScreenshotOnFailure('get_text_failure');
      throw error;
    }
  }

  async getInputValue(selector: string, timeout?: number): Promise<string> {
    const t = timeout ?? this.explicitWait;
    this.logger.debug(`Getting input value from element: ${selector}`);
    try {
      const value = await this.page.locator(selector).inputValue({ timeout: t });
      this.logger.debug(`Retrieved input value: '${value}' from ${selector}`);
      return value;
    } catch (error) {
      this.logger.error(`Failed to get input value from ${selector}: ${error}`);
      await this.takeScreenshotOnFailure('get_input_value_failure');
      throw error;
    }
  }

  async getAttribute(selector: string, attribute: string, timeout?: number): Promise<string | null> {
    const t = timeout ?? this.explicitWait;
    this.logger.debug(`Getting attribute '${attribute}' from element: ${selector}`);
    try {
      const value = await this.page.locator(selector).getAttribute(attribute, { timeout: t });
      this.logger.debug(`Retrieved attribute '${attribute}': '${value}' from ${selector}`);
      return value;
    } catch (error) {
      this.logger.error(`Failed to get attribute from ${selector}: ${error}`);
      await this.takeScreenshotOnFailure('get_attribute_failure');
      throw error;
    }
  }

  async isElementVisible(selector: string, timeout?: number): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({
        state: 'visible',
        timeout: timeout ?? 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  async isElementEnabled(selector: string, timeout?: number): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({
        state: 'visible',
        timeout: timeout ?? 5000,
      });
      return await this.page.locator(selector).isEnabled();
    } catch {
      return false;
    }
  }

  async hover(selector: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.debug(`Hovering over element: ${selector}`);
    try {
      await this.page.locator(selector).hover({ timeout: t });
      this.logger.debug(`Hovered over element: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to hover over element ${selector}: ${error}`);
      await this.takeScreenshotOnFailure('hover_failure');
      throw error;
    }
  }

  async check(selector: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.info(`Checking checkbox: ${selector}`);
    await this.page.locator(selector).check({ timeout: t });
  }

  async uncheck(selector: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.info(`Unchecking checkbox: ${selector}`);
    await this.page.locator(selector).uncheck({ timeout: t });
  }

  // ==================== WAIT METHODS ====================

  async waitForElementVisible(selector: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.debug(`Waiting for element to be visible: ${selector}`);
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: t });
      this.logger.debug(`Element is visible: ${selector}`);
    } catch (error) {
      this.logger.error(`Element not visible: ${selector} after ${t}ms`);
      await this.takeScreenshotOnFailure('element_not_visible');
      throw error;
    }
  }

  async waitForElementHidden(selector: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.debug(`Waiting for element to be hidden: ${selector}`);
    try {
      await this.page.locator(selector).waitFor({ state: 'hidden', timeout: t });
      this.logger.debug(`Element is hidden: ${selector}`);
    } catch (error) {
      this.logger.error(`Element still visible: ${selector} after ${t}ms`);
      await this.takeScreenshotOnFailure('element_still_visible');
      throw error;
    }
  }

  async waitForURL(urlPattern: string | RegExp, timeout?: number): Promise<void> {
    const t = timeout ?? this.explicitWait;
    this.logger.debug(`Waiting for URL: ${urlPattern}`);
    try {
      await this.page.waitForURL(urlPattern, { timeout: t });
      this.logger.debug(`URL matched: ${urlPattern}`);
    } catch (error) {
      this.logger.error(`URL did not match ${urlPattern} after ${t}ms`);
      await this.takeScreenshotOnFailure('url_check_failure');
      throw error;
    }
  }

  async waitForTextInElement(selector: string, text: string, timeout?: number): Promise<boolean> {
    const t = timeout ?? this.explicitWait;
    this.logger.debug(`Waiting for text '${text}' in element: ${selector}`);
    try {
      await this.page.locator(selector).filter({ hasText: text }).waitFor({
        state: 'visible',
        timeout: t,
      });
      this.logger.debug(`Text '${text}' present in element: ${selector}`);
      return true;
    } catch (error) {
      this.logger.error(`Text '${text}' not present in element: ${selector} after ${t}ms`);
      await this.takeScreenshotOnFailure('text_not_present');
      throw error;
    }
  }

  // ==================== SCREENSHOT METHODS ====================

  async takeScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filepath = `${this.screenshotDir}/${name}_${timestamp}.png`;

    try {
      await this.page.screenshot({ path: filepath, fullPage: true });
      this.logger.info(`Screenshot saved: ${filepath}`);
      return filepath;
    } catch (error) {
      this.logger.error(`Failed to save screenshot: ${error}`);
      throw error;
    }
  }

  private async takeScreenshotOnFailure(name: string): Promise<string | null> {
    if (this.screenshotsOnFailure) {
      try {
        return await this.takeScreenshot(name);
      } catch {
        return null;
      }
    }
    return null;
  }

  // ==================== JAVASCRIPT EXECUTION ====================

  async executeScript<T>(script: string, ...args: unknown[]): Promise<T> {
    this.logger.debug(`Executing JavaScript: ${script.substring(0, 100)}...`);
    try {
      const result = await this.page.evaluate(script, ...args) as T;
      this.logger.debug('JavaScript executed successfully');
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute JavaScript: ${error}`);
      throw error;
    }
  }

  async scrollToElement(selector: string): Promise<void> {
    this.logger.debug(`Scrolling to element: ${selector}`);
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    this.logger.debug(`Scrolled to element: ${selector}`);
  }

  async scrollToBottom(): Promise<void> {
    this.logger.debug('Scrolling to bottom of page');
    await this.page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
  }

  async scrollToTop(): Promise<void> {
    this.logger.debug('Scrolling to top of page');
    await this.page.evaluate('window.scrollTo(0, 0)');
  }

  // ==================== FRAME HANDLING ====================

  frameLocator(selector: string): FrameLocator {
    this.logger.info(`Accessing frame: ${selector}`);
    return this.page.frameLocator(selector);
  }

  // ==================== UTILITY METHODS ====================

  async getPageSource(): Promise<string> {
    return await this.page.content();
  }

  async close(): Promise<void> {
    this.logger.info('Closing page');
    await this.page.close();
  }
}
