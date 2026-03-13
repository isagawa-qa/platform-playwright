/**
 * ReferenceApiTasks - Task pattern examples for API and hybrid workflows.
 *
 * Demonstrates three task patterns:
 * 1. Pure API task - composes Api Objects only
 * 2. API-seed-then-UI-verify - creates data via API, verifies in browser
 * 3. UI-action-then-API-verify - performs UI action, confirms via API
 *
 * Rules:
 * - @autologger('Task') on all methods
 * - NO decorator on constructor
 * - Composes Api Objects (and optionally Page Objects for hybrid)
 * - One domain operation per method
 * - NO return values (returns void)
 */

import { ApiClient } from '../../interfaces/api-client';
import { BrowserInterface } from '../../interfaces/browser-interface';
import { autologger } from '../../utilities/autologger';
import { UsersApi } from '../apis/users-api';
import { InventoryPage } from '../pages/inventory-page';

// ==================== PURE API TASK ====================

/**
 * Tasks that compose Api Objects only. No browser needed.
 */
export class UserApiTasks {
  private readonly usersApi: UsersApi;

  constructor(api: ApiClient) {
    this.usersApi = new UsersApi(api);
  }

  @autologger('Task')
  async createUser(name: string, email: string, role: string): Promise<void> {
    await this.usersApi.create({ name, email, role });
    // NO return
  }

  @autologger('Task')
  async deleteUser(userId: number): Promise<void> {
    await this.usersApi.remove(userId);
    // NO return
  }

  @autologger('Task')
  async verifyUserExists(userId: number): Promise<void> {
    await this.usersApi.getById(userId);
    if (!this.usersApi.isLastStatusOk()) {
      throw new Error(`User ${userId} not found, status: ${this.usersApi.getLastStatus()}`);
    }
    // NO return
  }
}

// ==================== HYBRID TASK (API + UI) ====================

/**
 * Tasks that compose BOTH Api Objects and Page Objects.
 * Constructor receives both ApiClient and BrowserInterface.
 */
export class HybridInventoryTasks {
  private readonly usersApi: UsersApi;
  private readonly inventoryPage: InventoryPage;

  constructor(api: ApiClient, browser: BrowserInterface) {
    this.usersApi = new UsersApi(api);
    this.inventoryPage = new InventoryPage(browser);
  }

  /**
   * Pattern: API-seed-then-UI-verify
   * Create data via API, then navigate to UI to confirm it renders.
   */
  @autologger('Task')
  async seedUserAndVerifyInUI(name: string, email: string): Promise<void> {
    // API: create the data
    await this.usersApi.create({ name, email });

    // UI: navigate and verify it appears
    await this.inventoryPage.navigate();
    // NO return — test asserts via POM state-check methods
  }

  /**
   * Pattern: UI-action-then-API-verify
   * Perform a UI action, then confirm the backend state via API.
   */
  @autologger('Task')
  async addItemViaUIAndVerifyViaAPI(itemName: string, userId: number): Promise<void> {
    // UI: perform the action
    await this.inventoryPage.addItemToCart(itemName);

    // API: verify the backend state
    await this.usersApi.getById(userId);
    // NO return — test asserts via Api Object state-check methods
  }
}
