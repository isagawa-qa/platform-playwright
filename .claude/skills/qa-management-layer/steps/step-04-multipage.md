# Step 4 Extended: Multi-Page Workflow Guide

**Purpose:** Guide construction when a workflow spans multiple pages (e.g., login → inventory → cart → checkout).

---

## When to Use

Use this guide when Step 4 involves:
- Navigation between 2+ pages
- Workflows where user actions on Page A lead to Page B
- Multi-step forms or wizards
- Checkout/purchase flows

---

## Page Identification

From the BDD scenarios (Step 3), identify distinct pages:

```
Given I am on the LOGIN PAGE           → LoginPage
When I navigate to INVENTORY PAGE      → InventoryPage
And I add items to CART PAGE           → CartPage
And I complete CHECKOUT PAGE           → CheckoutPage
```

**Rule:** One POM per distinct page. A "page" = a distinct URL or significant DOM state change.

---

## Build Order (Multi-Page)

```
1. Build ALL Page Objects first (one per page)
   → framework/pages/{workflow}/login-page.ts
   → framework/pages/{workflow}/inventory-page.ts
   → framework/pages/{workflow}/cart-page.ts
   → framework/pages/{workflow}/checkout-page.ts

2. Build Tasks (compose multiple POMs)
   → framework/tasks/{workflow}/{workflow}-tasks.ts

3. Build Role (compose Tasks)
   → framework/roles/{workflow}/{role-name}-role.ts

4. Build Test (Role workflow calls, assert via POMs)
   → tests/{workflow}/test-{name}.spec.ts
```

---

## Cross-Page Navigation Pattern

### In Page Objects:

```typescript
// Each POM handles its OWN navigation trigger
export class InventoryPage {
  static readonly ADD_TO_CART_BUTTON = '[data-test="add-to-cart"]';
  static readonly CART_LINK = '.shopping_cart_link';

  async addItemToCart(): Promise<InventoryPage> {
    await this.browser.click(InventoryPage.ADD_TO_CART_BUTTON);
    return this;
  }

  async goToCart(): Promise<InventoryPage> {
    await this.browser.click(InventoryPage.CART_LINK);
    return this;
  }
}
```

### In Tasks:

```typescript
// Tasks chain POMs for cross-page flows
@autologger('Task')
async addItemAndGoToCart(itemName: string): Promise<void> {
  await this.inventoryPage.addItemToCart();
  await this.inventoryPage.goToCart();
  // CartPage takes over from here
}
```

---

## State-Check Methods (Multi-Page)

Each POM needs state-check methods for assertions:

```typescript
// LoginPage
async isLoggedIn(): Promise<boolean> { ... }

// InventoryPage
async getCartBadgeCount(): Promise<string> { ... }

// CartPage
async isItemInCart(itemName: string): Promise<boolean> { ... }

// CheckoutPage
async isOrderComplete(): Promise<boolean> { ... }
```

**Tests assert on the FINAL page's state:**

```typescript
// Assert on checkout completion
expect(await checkoutPage.isOrderComplete()).toBe(true);
```

---

## Common Multi-Page Patterns

| Pattern | How to Handle |
|---------|---------------|
| Login required first | Task calls loginPage → navigates to target |
| Shared header/nav | Separate NavigationPage POM in `common/` |
| Modal overlays | Same POM (not a new page), add modal methods |
| iframes | Use BrowserInterface frame methods |
| New tabs/windows | Use BrowserInterface context methods |

---

## File Organization

```
framework/pages/{workflow}/
  ├── login-page.ts          ← reuse from common/ if exists
  ├── inventory-page.ts
  ├── cart-page.ts
  └── checkout-page.ts

framework/tasks/{workflow}/
  └── {workflow}-tasks.ts     ← composes ALL POMs

framework/roles/{workflow}/
  └── {role-name}-role.ts     ← composes Tasks

tests/{workflow}/
  └── test-{name}.spec.ts    ← Role workflow calls, asserts via POMs
```

---

*Use this guide when Step 4 involves multi-page workflows. Single-page workflows use standard step-04.md only.*
