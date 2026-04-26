import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class UsersService {
  async getProfile(userId: number) {
    const user = await db('users')
      .where({ id: userId })
      .select('id', 'email', 'name', 'phone', 'date_of_birth', 'gender', 'religion', 'nid_number', 'tin_number', 'created_at', 'updated_at')
      .first();

    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async updateProfile(userId: number, data: Record<string, any>) {
    const allowedFields = ['name', 'phone', 'date_of_birth', 'gender', 'religion', 'nid_number', 'tin_number'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError(400, 'No valid fields to update');
    }

    updates.updated_at = db.fn.now();

    const [user] = await db('users')
      .where({ id: userId })
      .update(updates)
      .returning(['id', 'email', 'name', 'phone', 'date_of_birth', 'gender', 'religion', 'nid_number', 'tin_number', 'updated_at']);

    return user;
  }
}

export const usersService = new UsersService();
