import { ValidationError, type ErrorDetail } from '../errors/AppError.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Deliberately simple: "something@something.something". No regex can prove an address
// exists; only a confirmation email can.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Type guards: each returns true only if the value is valid, and tells TypeScript its type ----

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_PATTERN.test(value.trim());
}

function isValidPassword(value: unknown): value is string {
  // bcrypt ignores anything after 72 BYTES, and one emoji can be 4 bytes, so count bytes, not characters.
  return typeof value === 'string' && value.length >= 8 && Buffer.byteLength(value, 'utf8') <= 72;
}

function isValidName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 100;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function requireObject(body: unknown): Record<string, unknown> {
  if (!isObject(body)) {
    throw new ValidationError([{ field: 'body', message: 'must be a JSON object' }]);
  }
  return body;
}

// ---- Parsers: unknown in, typed and cleaned data out (or a ValidationError) ----

export function parseRegisterInput(body: unknown): RegisterInput {
  const { email, password, name } = requireObject(body);

  // Collect EVERY problem, so a form can show all errors at once.
  const details: ErrorDetail[] = [];
  if (!isEmail(email)) details.push({ field: 'email', message: 'must be a valid email address' });
  if (!isValidPassword(password)) {
    details.push({ field: 'password', message: 'must be 8 to 72 characters' });
  }
  if (!isValidName(name)) details.push({ field: 'name', message: 'must be 1 to 100 characters' });

  // The same checks again, combined, so TypeScript narrows all three to `string` below.
  if (!isEmail(email) || !isValidPassword(password) || !isValidName(name)) {
    throw new ValidationError(details);
  }

  return { email: email.trim().toLowerCase(), password, name: name.trim() };
}

export function parseLoginInput(body: unknown): LoginInput {
  const { email, password } = requireObject(body);

  const details: ErrorDetail[] = [];
  if (!isNonEmptyString(email)) details.push({ field: 'email', message: 'is required' });
  if (!isNonEmptyString(password)) details.push({ field: 'password', message: 'is required' });

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new ValidationError(details);
  }

  return { email: email.trim().toLowerCase(), password };
}
