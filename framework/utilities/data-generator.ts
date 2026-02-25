/**
 * Test data generation utility using @faker-js/faker and JSON data loading.
 */

import { faker } from '@faker-js/faker';
import * as fs from 'node:fs';
import * as path from 'node:path';

export class DataGenerator {
  private readonly dataDir: string;

  constructor(_locale: string = 'en', dataDir: string = 'tests/data') {
    faker.seed(0);
    this.dataDir = dataDir;
  }

  // ==================== PERSONAL DATA ====================

  generateFirstName(): string {
    return faker.person.firstName();
  }

  generateLastName(): string {
    return faker.person.lastName();
  }

  generateFullName(): string {
    return faker.person.fullName();
  }

  generateEmail(prefix?: string): string {
    if (prefix) {
      const domain = faker.internet.domainName();
      const num = faker.number.int({ min: 100000, max: 999999 });
      return `${prefix}_${num}@${domain}`;
    }
    return faker.internet.email();
  }

  generatePhoneNumber(): string {
    return faker.phone.number();
  }

  generatePassword(length: number = 12): string {
    return faker.internet.password({ length });
  }

  // ==================== ADDRESS DATA ====================

  generateAddressLine(): string {
    return faker.location.streetAddress();
  }

  generateCity(): string {
    return faker.location.city();
  }

  generateState(): string {
    return faker.location.state();
  }

  generateStateAbbr(): string {
    return faker.location.state({ abbreviated: true });
  }

  generateZipcode(): string {
    return faker.location.zipCode();
  }

  generateCountry(): string {
    return faker.location.country();
  }

  generateFullAddress(): Record<string, string> {
    return {
      address1: this.generateAddressLine(),
      address2: faker.datatype.boolean({ probability: 0.3 })
        ? faker.location.secondaryAddress()
        : '',
      city: this.generateCity(),
      state: this.generateState(),
      zipcode: this.generateZipcode(),
      country: 'United States',
    };
  }

  // ==================== COMPANY DATA ====================

  generateCompanyName(): string {
    return faker.company.name();
  }

  // ==================== USER DATA GENERATION ====================

  generateUserData(): Record<string, unknown> {
    const firstName = this.generateFirstName();
    const lastName = this.generateLastName();
    const email = this.generateEmail(`${firstName.toLowerCase()}_${lastName.toLowerCase()}`);

    return {
      first_name: firstName,
      last_name: lastName,
      email,
      password: this.generatePassword(10),
      phone: this.generatePhoneNumber(),
      company: faker.datatype.boolean() ? this.generateCompanyName() : '',
      address: this.generateFullAddress(),
    };
  }

  // ==================== JSON DATA LOADING ====================

  loadJsonData<T = unknown>(filename: string): T {
    const filepath = path.join(this.dataDir, filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Data file not found: ${filepath}`);
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content) as T;
  }

  loadUsers(filename: string = 'test_users.json'): Record<string, unknown>[] {
    return this.loadJsonData<Record<string, unknown>[]>(filename);
  }

  getUserByRole(role: string, filename: string = 'test_users.json'): Record<string, unknown> | undefined {
    const users = this.loadUsers(filename);
    return users.find((user) => user.role === role);
  }

  saveJsonData(data: unknown, filename: string): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    const filepath = path.join(this.dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // ==================== RANDOM DATA ====================

  randomNumber(min: number = 1, max: number = 100): number {
    return faker.number.int({ min, max });
  }

  randomChoice<T>(choices: T[]): T {
    return faker.helpers.arrayElement(choices);
  }

  randomText(maxChars: number = 200): string {
    return faker.lorem.text().substring(0, maxChars);
  }
}
