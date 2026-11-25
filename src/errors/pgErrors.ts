import pg from 'pg';

export const PG_UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  return (
    error instanceof pg.DatabaseError &&
    error.code === PG_UNIQUE_VIOLATION &&
    (constraint === undefined || error.constraint === constraint)
  );
}
