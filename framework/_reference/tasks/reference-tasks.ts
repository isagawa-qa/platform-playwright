/**
 * ReferenceTasks - Task pattern example for AI to learn from.
 *
 * This module provides high-level task methods that orchestrate page objects
 * to accomplish business workflows.
 *
 * Rules:
 * - @autologger('Task') on all methods
 * - NO decorator on constructor
 * - Composes Page Objects
 * - One domain operation per method
 * - NO return values (returns void)
 * - Uses fluent POM API
 */

import { BrowserInterface } from '../../interfaces/browser-interface';
import { autologger } from '../../utilities/autologger';
import { LoginPage } from '../pages/login-page';
import { InventoryPage } from '../pages/inventory-page';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';

export class ReferenceTasks {
  private readonly loginPage: LoginPage;
  private readonly inventoryPage: InventoryPage;
  private readonly cartPage: CartPage;
  private readonly checkoutPage: CheckoutPage;

  constructor(browser: BrowserInterface) {
    this.loginPage = new LoginPage(browser);
    this.inventoryPage = new InventoryPage(browser);
    this.cartPage = new CartPage(browser);
    this.checkoutPage = new CheckoutPage(browser);
  }

  // ==================== TASK METHODS ====================

  @autologger('Task')
  async loginAsUser(username: string, password: string): Promise<void> {
    await (await this.loginPage.navigate())
      .enterUsername(username);
    await this.loginPage.enterPassword(password);
    await this.loginPage.clickLogin();
    // NO return
  }

  @autologger('Task')
  async addItemAndGoToCart(itemName: string): Promise<void> {
    await this.inventoryPage.addItemToCart(itemName);
    await this.inventoryPage.clickCart();
    // NO return
  }

  @autologger('Task')
  async checkoutWithInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.cartPage.clickCheckout();
    await this.checkoutPage.enterFirstName(firstName);
    await this.checkoutPage.enterLastName(lastName);
    await this.checkoutPage.enterPostalCode(postalCode);
    await this.checkoutPage.clickContinue();
    await this.checkoutPage.clickFinish();
    // NO return
  }
}
