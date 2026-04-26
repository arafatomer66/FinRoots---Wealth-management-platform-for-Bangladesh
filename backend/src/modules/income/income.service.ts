import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { PaginationParams, PaginatedResult } from '../../utils/pagination';

export class IncomeService {
  async getAll(userId: number, pagination?: PaginationParams): Promise<PaginatedResult<any>> {
    const base = db('income').where({ user_id: userId });
    const countQuery = base.clone().count('* as total').first();
    const dataQuery = base.clone().orderBy('created_at', 'desc');
    if (pagination) dataQuery.limit(pagination.limit).offset(pagination.offset);
    const [data, countResult] = await Promise.all([dataQuery, countQuery]);
    const total = Number(countResult?.total) || 0;
    return { data, pagination: { page: pagination?.page || 1, limit: pagination?.limit || total, total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 } };
  }

  async getById(userId: number, id: number) {
    const item = await db('income').where({ id, user_id: userId }).first();
    if (!item) throw new AppError(404, 'Income entry not found');
    return item;
  }

  async create(userId: number, input: Record<string, any>) {
    const [item] = await db('income').insert({ ...input, user_id: userId }).returning('*');
    return item;
  }

  async update(userId: number, id: number, input: Record<string, any>) {
    const [item] = await db('income')
      .where({ id, user_id: userId })
      .update({ ...input, updated_at: db.fn.now() })
      .returning('*');
    if (!item) throw new AppError(404, 'Income entry not found');
    return item;
  }

  async delete(userId: number, id: number) {
    const deleted = await db('income').where({ id, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Income entry not found');
  }

  async getAnnualIncome(userId: number): Promise<number> {
    const entries = await db('income').where({ user_id: userId });
    let annual = 0;
    for (const entry of entries) {
      const amount = Number(entry.amount);
      switch (entry.frequency) {
        case 'monthly': annual += amount * 12; break;
        case 'quarterly': annual += amount * 4; break;
        case 'yearly': annual += amount; break;
        case 'one_time': annual += amount; break;
        default: annual += amount;
      }
    }
    return annual;
  }
}

export const incomeService = new IncomeService();
