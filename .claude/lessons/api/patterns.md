# API Testing Patterns

<!-- Seeded: expert knowledge for autonomous API test generation -->

## ApiClient-First Rule

All HTTP interactions go through ApiClient. Never use `fetch`, `axios`, or Playwright's
`APIRequestContext` directly. ApiClient provides logging, timing, auth, and typed responses.

## Request Patterns

### Basic CRUD

```typescript
// GET — retrieve resource
const response = await this.api.get<UserResponse>('/api/users/1');

// GET with query params
const response = await this.api.get<UserListResponse>('/api/users', {
  params: { page: '1', perPage: '20', status: 'active' },
});

// POST — create resource
const response = await this.api.post<UserResponse>('/api/users', {
  data: { name: 'John', email: 'john@test.com', role: 'viewer' },
});

// PUT — full replace
const response = await this.api.put<UserResponse>('/api/users/1', {
  data: { name: 'John Updated', email: 'john@test.com', role: 'admin' },
});

// PATCH — partial update
const response = await this.api.patch<UserResponse>('/api/users/1', {
  data: { role: 'admin' },
});

// DELETE — remove resource
const response = await this.api.delete('/api/users/1');
```

### Authentication Strategies

```typescript
// Bearer token (most common)
api.setAuthToken('eyJ...');
// All subsequent requests include Authorization: Bearer eyJ...

// API key via default headers
const config: ApiConfig = {
  baseURL: 'https://api.example.com',
  defaultHeaders: { 'X-API-Key': process.env.API_KEY! },
};

// Clear auth between test scenarios
api.clearAuthToken();
```

### Custom Headers

```typescript
// Per-request headers (merged with defaults + auth)
const response = await this.api.post('/api/upload', {
  data: fileBuffer,
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

## Api Object Patterns

### Endpoint Constants

```typescript
// Simple paths — static readonly
static readonly BASE_PATH = '/api/users';

// Parameterized paths — static method
static readonly SINGLE_PATH = (id: number) => `/api/users/${id}`;
static readonly USER_ROLES = (id: number) => `/api/users/${id}/roles`;
```

### Fluent Chaining

```typescript
// Api Object methods return this for chaining
await usersApi
  .create({ name: 'John', email: 'john@test.com' })
  .then(api => api.getById(1));

// Or sequential calls with state checks between
await usersApi.create({ name: 'John', email: 'john@test.com' });
expect(usersApi.getLastStatus()).toBe(201);
const id = usersApi.getLastBody<{ id: number }>().id;

await usersApi.getById(id);
expect(usersApi.isLastStatusOk()).toBe(true);
```

### Response Typing

```typescript
// Always define request/response interfaces per resource
interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

// Use generics for typed responses
const response = await this.api.get<UserResponse>(UsersApi.SINGLE_PATH(id));
// response.body is typed as UserResponse
```

## Anti-Patterns

```typescript
// NEVER — hardcoded URLs in Api Objects
await this.api.get('https://api.example.com/users');  // ✗ Use endpoint constants

// NEVER — raw fetch/axios
const response = await fetch('/api/users');             // ✗ Use ApiClient

// NEVER — untyped responses
const data = await this.api.get('/api/users');           // ✗ Always provide type parameter
const data = await this.api.get<UserResponse>('/api/users');  // ✓

// NEVER — assertions in Api Objects
if (this.lastResponse.status !== 200) throw new Error();  // ✗ Let tests assert
// State-check methods expose state, tests decide what to assert
```

---

*Seeded from Playwright APIRequestContext best practices and framework conventions.*
