import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../config/database';
import { authConfig } from '../../config/auth';
import { AppError } from '../../middleware/error.middleware';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await db('users').where({ email: input.email }).first();
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, authConfig.saltRounds);

    const [user] = await db('users')
      .insert({
        email: input.email,
        password_hash: passwordHash,
        name: input.name,
        phone: input.phone || null,
      })
      .returning(['id', 'email', 'name', 'phone', 'created_at']);

    const token = this.generateToken(user.id, user.email);

    return { user, token };
  }

  async login(input: LoginInput) {
    const user = await db('users').where({ email: input.email }).first();
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);

    const { password_hash: _, ...userData } = user;
    return { user: userData, token };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      throw new AppError(401, 'Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, authConfig.saltRounds);
    await db('users').where({ id: userId }).update({ password_hash: newHash, updated_at: db.fn.now() });
  }

  private generateToken(id: number, email: string): string {
    return jwt.sign({ id, email }, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiresIn,
    });
  }
}

export const authService = new AuthService();
