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

function loadEnv() {
  try {
    return {
      NODE_ENV: readNodeEnv(),
      PORT: readPort(),
      DATABASE_URL: readRequired('DATABASE_URL'),
    } as const;
  } catch (error) {
    console.error(`Invalid environment variables: ${(error as Error).message}`);
    process.exit(1);
  }
}

export const env = loadEnv();
