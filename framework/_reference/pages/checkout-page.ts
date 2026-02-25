/**
 * CheckoutPage - Page Object Model
 *
 * Page Object representing the SauceDemo checkout pages
 * (checkout-step-one and checkout-step-two).
 */

import { BrowserInterface } from '../../interfaces/browser-interface';

export class CheckoutPage {
  constructor(private readonly browser: BrowserInterface) {}

  // ==================== LOCATORS (Class Constants) ====================
  static readonly FIRST_NAME_INPUT = '[data-test="firstName"]';
  static readonly LAST_NAME_INPUT = '[data-test="lastName"]';
  static readonly POSTAL_CODE_INPUT = '[data-test="postalCode"]';
  static readonly CONTINUE_BUTTON = '[data-test="continue"]';
  static readonly CANCEL_BUTTON = '[data-test="cancel"]';
  static readonly FINISH_BUTTON = '[data-test="finish"]';
  static readonly BACK_HOME_BUTTON = '[data-test="back-to-products"]';
  static readonly COMPLETE_HEADER = '.complete-header';
  static readonly SUMMARY_TOTAL = '.summary_total_label';
  static readonly ERROR_MESSAGE = '[data-test="error"]';

  // ==================== ATOMIC METHODS (One UI Action) ====================

  async enterFirstName(name: string): Promise<CheckoutPage> {
    await this.browser.fill(CheckoutPage.FIRST_NAME_INPUT, name);
    return this;
  }

  async enterLastName(name: string): Promise<CheckoutPage> {
    await this.browser.fill(CheckoutPage.LAST_NAME_INPUT, name);
    return this;
  }

  async enterPostalCode(code: string): Promise<CheckoutPage> {
    await this.browser.fill(CheckoutPage.POSTAL_CODE_INPUT, code);
    return this;
  }

  async clickContinue(): Promise<CheckoutPage> {
    await this.browser.click(CheckoutPage.CONTINUE_BUTTON);
    return this;
  }

  async clickCancel(): Promise<CheckoutPage> {
    await this.browser.click(CheckoutPage.CANCEL_BUTTON);
    return this;
  }

  async clickFinish(): Promise<CheckoutPage> {
    await this.browser.click(CheckoutPage.FINISH_BUTTON);
    return this;
  }

  async clickBackHome(): Promise<CheckoutPage> {
    await this.browser.click(CheckoutPage.BACK_HOME_BUTTON);
    return this;
  }

  // ==================== STATE-CHECK METHODS (For Assertions) ====================

  async isOrderComplete(): Promise<boolean> {
    return await this.browser.isElementVisible(CheckoutPage.COMPLETE_HEADER, 5000);
  }

  async getCompleteHeaderText(): Promise<string> {
    return await this.browser.getText(CheckoutPage.COMPLETE_HEADER);
  }

  async getSummaryTotal(): Promise<string> {
    return await this.browser.getText(CheckoutPage.SUMMARY_TOTAL);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await this.browser.isElementVisible(CheckoutPage.ERROR_MESSAGE, 3000);
  }

  async getErrorText(): Promise<string> {
    return await this.browser.getText(CheckoutPage.ERROR_MESSAGE);
  }
}
