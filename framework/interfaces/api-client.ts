/**
 * ApiClient - Playwright APIRequestContext wrapper with enhanced functionality.
 *
 * Provides:
 * - HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * - Response validation helpers
 * - Authentication token management
 * - Request/response logging
 * - Configurable timeouts and base URL
 *
 * Mirrors BrowserInterface patterns:
 * - Config interface for initialization
 * - Logger injection for comprehensive logging
 * - Structured error handling with context
 * - Method grouping by concern
 */

import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../utilities/logger';

export interface ApiConfig {
  baseURL: string;
  defaultTimeout?: number;
  defaultHeaders?: Record<string, string>;
}

export interface ApiResponseData<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: T;
  responseTime: number;
}

export class ApiClient {
  readonly request: APIRequestContext;
  readonly config: ApiConfig;
  private readonly logger: Logger;
  private readonly defaultTimeout: number;
  private authToken: string | null = null;

  constructor(request: APIRequestContext, config: ApiConfig, logger: Logger) {
    this.request = request;
    this.config = config;
    this.logger = logger;
    this.defaultTimeout = config.defaultTimeout ?? 30000;
  }

  // ==================== AUTHENTICATION METHODS ====================

  setAuthToken(token: string): void {
    this.logger.info('Auth token set');
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.logger.info('Auth token cleared');
    this.authToken = null;
  }

  private getHeaders(headers?: Record<string, string>): Record<string, string> {
    const merged: Record<string, string> = {
      ...this.config.defaultHeaders,
      ...headers,
    };
    if (this.authToken) {
      merged['Authorization'] = `Bearer ${this.authToken}`;
    }
    return merged;
  }

  // ==================== HTTP METHODS ====================

  async get<T = unknown>(
    endpoint: string,
    options?: { headers?: Record<string, string>; params?: Record<string, string>; timeout?: number },
  ): Promise<ApiResponseData<T>> {
    const url = this.buildUrl(endpoint, options?.params);
    this.logger.info(`GET ${url}`);
    try {
      const startTime = Date.now();
      const response = await this.request.get(url, {
        headers: this.getHeaders(options?.headers),
        timeout: options?.timeout ?? this.defaultTimeout,
      });
      return await this.processResponse<T>(response, startTime, 'GET', url);
    } catch (error) {
      this.logger.error(`GET ${url} failed: ${error}`);
      throw error;
    }
  }

  async post<T = unknown>(
    endpoint: string,
    options?: { data?: unknown; headers?: Record<string, string>; timeout?: number },
  ): Promise<ApiResponseData<T>> {
    const url = this.buildUrl(endpoint);
    this.logger.info(`POST ${url}`);
    try {
      const startTime = Date.now();
      const response = await this.request.post(url, {
        data: options?.data,
        headers: this.getHeaders(options?.headers),
        timeout: options?.timeout ?? this.defaultTimeout,
      });
      return await this.processResponse<T>(response, startTime, 'POST', url);
    } catch (error) {
      this.logger.error(`POST ${url} failed: ${error}`);
      throw error;
    }
  }

  async put<T = unknown>(
    endpoint: string,
    options?: { data?: unknown; headers?: Record<string, string>; timeout?: number },
  ): Promise<ApiResponseData<T>> {
    const url = this.buildUrl(endpoint);
    this.logger.info(`PUT ${url}`);
    try {
      const startTime = Date.now();
      const response = await this.request.put(url, {
        data: options?.data,
        headers: this.getHeaders(options?.headers),
        timeout: options?.timeout ?? this.defaultTimeout,
      });
      return await this.processResponse<T>(response, startTime, 'PUT', url);
    } catch (error) {
      this.logger.error(`PUT ${url} failed: ${error}`);
      throw error;
    }
  }

  async patch<T = unknown>(
    endpoint: string,
    options?: { data?: unknown; headers?: Record<string, string>; timeout?: number },
  ): Promise<ApiResponseData<T>> {
    const url = this.buildUrl(endpoint);
    this.logger.info(`PATCH ${url}`);
    try {
      const startTime = Date.now();
      const response = await this.request.patch(url, {
        data: options?.data,
        headers: this.getHeaders(options?.headers),
        timeout: options?.timeout ?? this.defaultTimeout,
      });
      return await this.processResponse<T>(response, startTime, 'PATCH', url);
    } catch (error) {
      this.logger.error(`PATCH ${url} failed: ${error}`);
      throw error;
    }
  }

  async delete<T = unknown>(
    endpoint: string,
    options?: { data?: unknown; headers?: Record<string, string>; timeout?: number },
  ): Promise<ApiResponseData<T>> {
    const url = this.buildUrl(endpoint);
    this.logger.info(`DELETE ${url}`);
    try {
      const startTime = Date.now();
      const response = await this.request.delete(url, {
        data: options?.data,
        headers: this.getHeaders(options?.headers),
        timeout: options?.timeout ?? this.defaultTimeout,
      });
      return await this.processResponse<T>(response, startTime, 'DELETE', url);
    } catch (error) {
      this.logger.error(`DELETE ${url} failed: ${error}`);
      throw error;
    }
  }

  // ==================== RESPONSE HELPERS ====================

  assertStatus(response: ApiResponseData, expected: number): void {
    if (response.status !== expected) {
      const msg = `Expected status ${expected}, got ${response.status}`;
      this.logger.error(msg);
      throw new Error(msg);
    }
    this.logger.debug(`Status ${response.status} matches expected ${expected}`);
  }

  assertStatusIn(response: ApiResponseData, expected: number[]): void {
    if (!expected.includes(response.status)) {
      const msg = `Expected status in [${expected.join(', ')}], got ${response.status}`;
      this.logger.error(msg);
      throw new Error(msg);
    }
    this.logger.debug(`Status ${response.status} is in expected set [${expected.join(', ')}]`);
  }

  // ==================== PRIVATE HELPERS ====================

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const base = endpoint.startsWith('http') ? endpoint : `${this.config.baseURL}${endpoint}`;
    if (!params || Object.keys(params).length === 0) {
      return base;
    }
    const query = new URLSearchParams(params).toString();
    return `${base}?${query}`;
  }

  private async processResponse<T>(
    response: APIResponse,
    startTime: number,
    method: string,
    url: string,
  ): Promise<ApiResponseData<T>> {
    const responseTime = Date.now() - startTime;
    const status = response.status();
    const statusText = response.statusText();

    let body: T;
    const contentType = response.headers()['content-type'] ?? '';
    if (contentType.includes('application/json')) {
      body = (await response.json()) as T;
    } else {
      body = (await response.text()) as unknown as T;
    }

    const headers: Record<string, string> = {};
    const rawHeaders = response.headers();
    for (const [key, value] of Object.entries(rawHeaders)) {
      headers[key] = value;
    }

    this.logger.info(`${method} ${url} → ${status} ${statusText} (${responseTime}ms)`);

    return { status, statusText, headers, body, responseTime };
  }
}
