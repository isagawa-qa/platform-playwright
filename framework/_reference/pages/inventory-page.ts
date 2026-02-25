/**
 * InventoryPage - Page Object Model
 *
 * Page Object representing the SauceDemo inventory/products page.
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

export class InventoryPage {
  constructor(private readonly browser: BrowserInterface) {}

  // ==================== LOCATORS (Class Constants) ====================
  static readonly PAGE_TITLE = '.title';
  static readonly INVENTORY_LIST = '.inventory_list';
  static readonly INVENTORY_ITEM = '.inventory_item';
  static readonly SORT_DROPDOWN = '[data-test="product-sort-container"]';
  static readonly CART_BADGE = '.shopping_cart_badge';
  static readonly CART_LINK = '.shopping_cart_link';
  static readonly BURGER_MENU = '#react-burger-menu-btn';
  static readonly LOGOUT_LINK = '#logout_sidebar_link';

  // Helper to build add-to-cart selector for a specific item
  static addToCartButton(itemName: string): string {
    const slug = itemName.toLowerCase().replace(/ /g, '-');
    return `[data-test="add-to-cart-${slug}"]`;
  }

  static removeButton(itemName: string): string {
    const slug = itemName.toLowerCase().replace(/ /g, '-');
    return `[data-test="remove-${slug}"]`;
  }

  // ==================== NAVIGATION ====================

  async navigate(): Promise<InventoryPage> {
    await this.browser.navigateTo(this.browser.config.baseURL + '/inventory.html');
    return this;
  }

  // ==================== ATOMIC METHODS (One UI Action) ====================

  async addItemToCart(itemName: string): Promise<InventoryPage> {
    await this.browser.click(InventoryPage.addToCartButton(itemName));
    return this;
  }

  async removeItemFromCart(itemName: string): Promise<InventoryPage> {
    await this.browser.click(InventoryPage.removeButton(itemName));
    return this;
  }

  async selectSortOption(value: string): Promise<InventoryPage> {
    await this.browser.selectOptionByValue(InventoryPage.SORT_DROPDOWN, value);
    return this;
  }

  async clickCart(): Promise<InventoryPage> {
    await this.browser.click(InventoryPage.CART_LINK);
    return this;
  }

  async openBurgerMenu(): Promise<InventoryPage> {
    await this.browser.click(InventoryPage.BURGER_MENU);
    return this;
  }

  async clickLogout(): Promise<InventoryPage> {
    await this.browser.click(InventoryPage.LOGOUT_LINK);
    return this;
  }

  // ==================== STATE-CHECK METHODS (For Assertions) ====================

  async isOnInventoryPage(): Promise<boolean> {
    return await this.browser.isElementVisible(InventoryPage.INVENTORY_LIST, 5000);
  }

  async getPageTitle(): Promise<string> {
    return await this.browser.getText(InventoryPage.PAGE_TITLE);
  }

  async getCartBadgeCount(): Promise<string> {
    return await this.browser.getText(InventoryPage.CART_BADGE);
  }

  async isCartBadgeVisible(): Promise<boolean> {
    return await this.browser.isElementVisible(InventoryPage.CART_BADGE, 2000);
  }
}
