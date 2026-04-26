import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { PaginationParams, PaginatedResult } from '../../utils/pagination';

export class GoalsService {
  async getAll(userId: number, pagination?: PaginationParams): Promise<PaginatedResult<any>> {
    const base = db('goals').where({ user_id: userId });
    const countQuery = base.clone().count('* as total').first();
    const dataQuery = base.clone().orderBy('target_date', 'asc');
    if (pagination) dataQuery.limit(pagination.limit).offset(pagination.offset);
    const [data, countResult] = await Promise.all([dataQuery, countQuery]);
    const total = Number(countResult?.total) || 0;
    return { data, pagination: { page: pagination?.page || 1, limit: pagination?.limit || total, total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 } };
  }

  async getById(userId: number, id: number) {
    const goal = await db('goals').where({ id, user_id: userId }).first();
    if (!goal) throw new AppError(404, 'Goal not found');
    return goal;
  }

  async create(userId: number, input: Record<string, any>) {
    const [goal] = await db('goals').insert({ ...input, user_id: userId }).returning('*');
    return goal;
  }

  async update(userId: number, id: number, input: Record<string, any>) {
    const [goal] = await db('goals')
      .where({ id, user_id: userId })
      .update({ ...input, updated_at: db.fn.now() })
      .returning('*');
    if (!goal) throw new AppError(404, 'Goal not found');
    return goal;
  }

  async delete(userId: number, id: number) {
    const deleted = await db('goals').where({ id, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Goal not found');
  }
}

export const goalsService = new GoalsService();
