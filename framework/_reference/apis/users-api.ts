/**
 * UsersApi - Api Object pattern example for AI to learn from.
 *
 * Api Object representing a Users REST resource.
 * Provides atomic API interactions via ApiClient composition.
 *
 * Rules:
 * - NO decorators (same as Page Objects)
 * - Endpoint config as static class constants
 * - Atomic methods (one API operation)
 * - Return this for chaining
 * - State-check methods for assertions
 * - Typed request/response shapes
 */

import { ApiClient, ApiResponseData } from '../../interfaces/api-client';

// ==================== REQUEST/RESPONSE TYPES ====================

interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UserListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  perPage: number;
}

export class UsersApi {
  private lastResponse: ApiResponseData | null = null;

  constructor(private readonly api: ApiClient) {}

  // ==================== ENDPOINT CONFIG (Class Constants) ====================

  static readonly BASE_PATH = '/api/users';
  static readonly SINGLE_PATH = (id: number) => `/api/users/${id}`;

  // ==================== CRUD METHODS (One API Operation) ====================

  async getAll(params?: { page?: string; perPage?: string }): Promise<UsersApi> {
    this.lastResponse = await this.api.get<UserListResponse>(
      UsersApi.BASE_PATH,
      { params },
    );
    return this;
  }

  async getById(id: number): Promise<UsersApi> {
    this.lastResponse = await this.api.get<UserResponse>(
      UsersApi.SINGLE_PATH(id),
    );
    return this;
  }

  async create(data: CreateUserRequest): Promise<UsersApi> {
    this.lastResponse = await this.api.post<UserResponse>(
      UsersApi.BASE_PATH,
      { data },
    );
    return this;
  }

  async update(id: number, data: UpdateUserRequest): Promise<UsersApi> {
    this.lastResponse = await this.api.put<UserResponse>(
      UsersApi.SINGLE_PATH(id),
      { data },
    );
    return this;
  }

  async patch(id: number, data: UpdateUserRequest): Promise<UsersApi> {
    this.lastResponse = await this.api.patch<UserResponse>(
      UsersApi.SINGLE_PATH(id),
      { data },
    );
    return this;
  }

  async remove(id: number): Promise<UsersApi> {
    this.lastResponse = await this.api.delete(
      UsersApi.SINGLE_PATH(id),
    );
    return this;
  }

  // ==================== STATE-CHECK METHODS (For Assertions) ====================

  getLastStatus(): number {
    if (!this.lastResponse) throw new Error('No API call has been made yet');
    return this.lastResponse.status;
  }

  getLastBody<T = unknown>(): T {
    if (!this.lastResponse) throw new Error('No API call has been made yet');
    return this.lastResponse.body as T;
  }

  getLastResponseTime(): number {
    if (!this.lastResponse) throw new Error('No API call has been made yet');
    return this.lastResponse.responseTime;
  }

  getLastHeader(name: string): string | undefined {
    if (!this.lastResponse) throw new Error('No API call has been made yet');
    return this.lastResponse.headers[name.toLowerCase()];
  }

  isLastStatusOk(): boolean {
    if (!this.lastResponse) return false;
    return this.lastResponse.status >= 200 && this.lastResponse.status < 300;
  }
}
