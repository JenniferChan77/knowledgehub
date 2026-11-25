type NodeEnv = 'development' | 'test' | 'production';

const NODE_ENVS: readonly NodeEnv[] = ['development', 'test', 'production'];

function readNodeEnv(): NodeEnv {
  const value = process.env.NODE_ENV ?? 'development';
  if (!NODE_ENVS.includes(value as NodeEnv)) {
    throw new Error(`NODE_ENV must be one of ${NODE_ENVS.join(', ')}, got "${value}"`);
  }
  return value as NodeEnv;
}

function readPort(): number {
  const raw = process.env.PORT ?? '3000';
  const port = Number(raw);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${raw}"`);
  }

  return port;
}

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function readSecret(name: string, minLength: number): string {
  const value = readRequired(name);
  if (value.length < minLength) {
    throw new Error(`${name} must be at least ${minLength} characters`);
  }
  return value;
}

function readPositiveInt(name: string, defaultVaule: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return defaultVaule;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return value;
}

function loadEnv() {
  try {
    return {
      NODE_ENV: readNodeEnv(),
      PORT: readPort(),
      DATABASE_URL: readRequired('DATABASE_URL'),
      JWT_SECRET: readSecret('JWT_SECRET', 32),
      JWT_EXPIRES_IN_SECONDS: readPositiveInt('JWT_EXPIRES_IN_SECONDS', 3600),
    } as const;
  } catch (error) {
    console.error(`Invalid environment variables: ${(error as Error).message}`);
    process.exit(1);
  }
}

export const env = loadEnv();
