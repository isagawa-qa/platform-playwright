/**
 * TestReferenceWorkflow - Test pattern example for AI to learn from.
 *
 * Test suite for purchasing an item on SauceDemo.
 * Uses AAA pattern: Arrange, Act, Assert.
 *
 * Rules:
 * - Call ONE Role workflow method per test
 * - Assert via Page Object state-check methods
 * - NO orchestration (Role handles workflow)
 */

import { test, expect } from '../../../tests/fixtures';
import { ReferenceRole } from '../roles/reference-role';
import { CheckoutPage } from '../pages/checkout-page';
import { InventoryPage } from '../pages/inventory-page';
import { faker } from '@faker-js/faker';

test.describe('Reference Workflow - Purchase Item', () => {
  test('complete purchase as standard user', async ({ browser_interface }) => {
    // Arrange - Generate test data + create role
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const postalCode = faker.location.zipCode();

    const user = new ReferenceRole(browser_interface);
    const checkoutPage = new CheckoutPage(browser_interface);

    // Act - ONE workflow call that orchestrates multiple operations
    await user.purchaseItem(
      'standard_user',
      'secret_sauce',
      'Sauce Labs Backpack',
      firstName,
      lastName,
      postalCode,
    );

    // Assert - Via Page Object state-check methods (NOT return value)
    expect(await checkoutPage.isOrderComplete()).toBe(true);
    expect(await checkoutPage.getCompleteHeaderText()).toBe('Thank you for your order!');
  });

  test('add item to cart as standard user', async ({ browser_interface }) => {
    // Arrange
    const user = new ReferenceRole(browser_interface);
    const inventoryPage = new InventoryPage(browser_interface);

    // Act - ONE workflow call
    await user.loginAndAddToCart(
      'standard_user',
      'secret_sauce',
      'Sauce Labs Backpack',
    );

    // Assert - Via POM state-check methods
    expect(await inventoryPage.isCartBadgeVisible()).toBe(true);
  });
});
