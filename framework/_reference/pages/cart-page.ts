/**
 * CartPage - Page Object Model
 *
 * Page Object representing the SauceDemo shopping cart page.
 * Provides atomic UI interactions via BrowserInterface composition.
 */

import { BrowserInterface } from '../../interfaces/browser-interface';

export class CartPage {
  constructor(private readonly browser: BrowserInterface) {}

  // ==================== LOCATORS (Class Constants) ====================
  static readonly PAGE_TITLE = '.title';
  static readonly CART_ITEM = '.cart_item';
  static readonly CHECKOUT_BUTTON = '[data-test="checkout"]';
  static readonly CONTINUE_SHOPPING_BUTTON = '[data-test="continue-shopping"]';

  static removeButton(itemName: string): string {
    const slug = itemName.toLowerCase().replace(/ /g, '-');
    return `[data-test="remove-${slug}"]`;
  }

  // ==================== NAVIGATION ====================

  async navigate(): Promise<CartPage> {
    await this.browser.navigateTo(this.browser.config.baseURL + '/cart.html');
    return this;
  }

  // ==================== ATOMIC METHODS (One UI Action) ====================

  async removeItem(itemName: string): Promise<CartPage> {
    await this.browser.click(CartPage.removeButton(itemName));
    return this;
  }

  async clickCheckout(): Promise<CartPage> {
    await this.browser.click(CartPage.CHECKOUT_BUTTON);
    return this;
  }

  async clickContinueShopping(): Promise<CartPage> {
    await this.browser.click(CartPage.CONTINUE_SHOPPING_BUTTON);
    return this;
  }

  // ==================== STATE-CHECK METHODS (For Assertions) ====================

  async isOnCartPage(): Promise<boolean> {
    return await this.browser.isElementVisible(CartPage.CHECKOUT_BUTTON, 5000);
  }

  async getPageTitle(): Promise<string> {
    return await this.browser.getText(CartPage.PAGE_TITLE);
  }
}
