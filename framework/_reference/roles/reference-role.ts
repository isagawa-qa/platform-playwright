/**
 * ReferenceRole - Role pattern example for AI to learn from.
 *
 * Roles represent user personas (e.g., StandardUser, Admin, Guest).
 * This role orchestrates complete business workflows using Task modules.
 *
 * Rules:
 * - @autologger('Role') on workflow methods
 * - @autologger('Role Constructor') on constructor (via init method)
 * - Composes Task modules
 * - Workflow methods call MULTIPLE tasks
 * - NO return values (returns void)
 * - NO locators
 */

import { BrowserInterface } from '../../interfaces/browser-interface';
import { autologger } from '../../utilities/autologger';
import { ReferenceTasks } from '../tasks/reference-tasks';

export class ReferenceRole {
  private readonly tasks: ReferenceTasks;

  constructor(browser: BrowserInterface) {
    this.tasks = new ReferenceTasks(browser);
  }

  // ==================== WORKFLOW METHODS ====================

  @autologger('Role')
  async loginAndAddToCart(
    username: string,
    password: string,
    itemName: string,
  ): Promise<void> {
    await this.tasks.loginAsUser(username, password);
    await this.tasks.addItemAndGoToCart(itemName);
    // NO return - test asserts via POM
  }

  @autologger('Role')
  async purchaseItem(
    username: string,
    password: string,
    itemName: string,
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.tasks.loginAsUser(username, password);
    await this.tasks.addItemAndGoToCart(itemName);
    await this.tasks.checkoutWithInfo(firstName, lastName, postalCode);
    // NO return - test asserts via POM
  }
}
