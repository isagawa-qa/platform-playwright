/**
 * TestReferenceApiWorkflow - Test pattern examples for API and hybrid tests.
 *
 * Demonstrates three test patterns:
 * 1. Pure API test - no browser, uses api_client fixture only
 * 2. Hybrid test - uses both api_client and browser_interface fixtures
 * 3. API data seeding with UI verification
 *
 * Rules:
 * - Call ONE Role/Task workflow method per test
 * - Assert via Api Object state-check methods (API) or POM state-check methods (UI)
 * - NO orchestration (Role/Task handles workflow)
 * - AAA pattern: Arrange, Act, Assert
 */

import { test, expect } from '../../../tests/fixtures';
import { UsersApi } from '../apis/users-api';
import { UserApiTasks } from '../tasks/reference-api-tasks';
import { HybridInventoryTasks } from '../tasks/reference-api-tasks';
import { faker } from '@faker-js/faker';

// ==================== PURE API TESTS ====================

test.describe('Reference API Workflow - User CRUD', () => {
  test('create a new user via API', async ({ api_client }) => {
    // Arrange
    const usersApi = new UsersApi(api_client);
    const name = faker.person.fullName();
    const email = faker.internet.email();

    // Act
    await usersApi.create({ name, email, role: 'viewer' });

    // Assert - Via Api Object state-check methods
    expect(usersApi.getLastStatus()).toBe(201);
    expect(usersApi.isLastStatusOk()).toBe(true);

    const body = usersApi.getLastBody<{ id: number; name: string }>();
    expect(body.name).toBe(name);
  });

  test('get all users via API', async ({ api_client }) => {
    // Arrange
    const usersApi = new UsersApi(api_client);

    // Act
    await usersApi.getAll({ page: '1', perPage: '10' });

    // Assert
    expect(usersApi.getLastStatus()).toBe(200);

    const body = usersApi.getLastBody<{ users: unknown[]; total: number }>();
    expect(body.users).toBeDefined();
    expect(body.total).toBeGreaterThanOrEqual(0);
  });

  test('delete a user via API', async ({ api_client }) => {
    // Arrange - Create user first, then delete
    const usersApi = new UsersApi(api_client);
    await usersApi.create({ name: 'Temp User', email: 'temp@test.com' });
    const created = usersApi.getLastBody<{ id: number }>();

    // Act
    await usersApi.remove(created.id);

    // Assert
    expect(usersApi.getLastStatus()).toBe(204);
  });
});

// ==================== HYBRID TESTS (API + UI) ====================

test.describe('Reference Hybrid Workflow - API Seed + UI Verify', () => {
  test('seed user via API then verify in UI', async ({ api_client, browser_interface }) => {
    // Arrange
    const tasks = new HybridInventoryTasks(api_client, browser_interface);
    const name = faker.person.fullName();
    const email = faker.internet.email();

    // Act - ONE task method that orchestrates API seed + UI navigation
    await tasks.seedUserAndVerifyInUI(name, email);

    // Assert - Via POM state-check methods (UI verification)
    // Test-specific assertions go here based on what the UI should show
  });

  test('perform UI action then verify via API', async ({ api_client, browser_interface }) => {
    // Arrange
    const tasks = new HybridInventoryTasks(api_client, browser_interface);

    // Act
    await tasks.addItemViaUIAndVerifyViaAPI('Sauce Labs Backpack', 1);

    // Assert - Via Api Object state-check methods (API verification)
    const usersApi = new UsersApi(api_client);
    await usersApi.getById(1);
    expect(usersApi.isLastStatusOk()).toBe(true);
  });
});
