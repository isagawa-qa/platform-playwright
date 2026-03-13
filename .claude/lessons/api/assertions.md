# API Assertions

<!-- Seeded: expert knowledge for API response validation -->

## Status Code Assertions

```typescript
// Exact status match
expect(usersApi.getLastStatus()).toBe(200);
expect(usersApi.getLastStatus()).toBe(201);  // Created
expect(usersApi.getLastStatus()).toBe(204);  // No Content (DELETE)

// Range check via state-check method
expect(usersApi.isLastStatusOk()).toBe(true);  // 200-299

// Negative tests — expect errors
expect(usersApi.getLastStatus()).toBe(400);  // Bad Request
expect(usersApi.getLastStatus()).toBe(401);  // Unauthorized
expect(usersApi.getLastStatus()).toBe(403);  // Forbidden
expect(usersApi.getLastStatus()).toBe(404);  // Not Found
expect(usersApi.getLastStatus()).toBe(422);  // Unprocessable Entity
```

## Response Body Assertions

```typescript
// Typed body extraction
const body = usersApi.getLastBody<UserResponse>();

// Field existence
expect(body.id).toBeDefined();
expect(body.name).toBeDefined();

// Field values
expect(body.name).toBe('John');
expect(body.email).toContain('@');
expect(body.role).toBe('viewer');

// Nested objects
expect(body.address.city).toBe('Las Vegas');

// Arrays
const list = usersApi.getLastBody<UserListResponse>();
expect(list.users).toHaveLength(10);
expect(list.users[0].name).toBeDefined();
expect(list.total).toBeGreaterThan(0);
```

## Header Assertions

```typescript
// Content type
expect(usersApi.getLastHeader('content-type')).toContain('application/json');

// Pagination headers
expect(usersApi.getLastHeader('x-total-count')).toBeDefined();

// Cache control
expect(usersApi.getLastHeader('cache-control')).toContain('no-cache');
```

## Response Timing

```typescript
// Performance check
expect(usersApi.getLastResponseTime()).toBeLessThan(2000);  // Under 2 seconds
```

## ApiClient Built-In Validators

```typescript
// Use for guard-style validation in Tasks (throws on mismatch)
api.assertStatus(response, 200);
api.assertStatusIn(response, [200, 201]);
```

## Patterns by Test Type

### Create → Verify Round-Trip

```typescript
// Create
await usersApi.create({ name: 'John', email: 'john@test.com' });
expect(usersApi.getLastStatus()).toBe(201);
const created = usersApi.getLastBody<UserResponse>();

// Verify via GET
await usersApi.getById(created.id);
expect(usersApi.getLastStatus()).toBe(200);
const fetched = usersApi.getLastBody<UserResponse>();
expect(fetched.name).toBe('John');
```

### Negative Testing

```typescript
// Missing required field
await usersApi.create({ name: '', email: '' });
expect(usersApi.getLastStatus()).toBe(400);

// Non-existent resource
await usersApi.getById(999999);
expect(usersApi.getLastStatus()).toBe(404);

// Unauthorized access
api.clearAuthToken();
await usersApi.getAll();
expect(usersApi.getLastStatus()).toBe(401);
```

---

*Seeded from Playwright Test assertion patterns and REST API testing best practices.*
