import { pool } from '../db/pool.js';
import type { User } from '../types/user.js';

// Rename snake_case columns to camelCase once, here. The rest of the app only sees camelCase.
const USER_COLUMNS = `
  id,
  email,
  password_hash AS "passwordHash",
  name,
  created_at    AS "createdAt",
  updated_at    AS "updatedAt"
`;

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
}

export const userRepository = {
  async findById(id: number): Promise<User | null> {
    const { rows } = await pool.query<User>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [
      id,
    ]);
    return rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      `SELECT ${USER_COLUMNS} FROM users WHERE lower(email) = lower($1)`,
      [email],
    );
    return rows[0] ?? null;
  },

  async create(data: CreateUserData): Promise<User> {
    const { rows } = await pool.query<User>(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1,$2,$3)
       RETURNING ${USER_COLUMNS}`,
      [data.email, data.passwordHash, data.name],
    );
    const user = rows[0];
    if (!user) throw new Error('INSERT ... RETURNING returned no row'); // can't happen; satisfies TypeScript
    return user;
  },
};
