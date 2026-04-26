import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { PaginationParams, PaginatedResult } from '../../utils/pagination';

export class LiabilitiesService {
  async getAll(userId: number, pagination?: PaginationParams): Promise<PaginatedResult<any>> {
    const base = db('liabilities').where({ user_id: userId });
    const countQuery = base.clone().count('* as total').first();
    const dataQuery = base.clone().orderBy('created_at', 'desc');
    if (pagination) dataQuery.limit(pagination.limit).offset(pagination.offset);
    const [data, countResult] = await Promise.all([dataQuery, countQuery]);
    const total = Number(countResult?.total) || 0;
    return { data, pagination: { page: pagination?.page || 1, limit: pagination?.limit || total, total, totalPages: pagination ? Math.ceil(total / pagination.limit) : 1 } };
  }

  async getById(userId: number, id: number) {
    const item = await db('liabilities').where({ id, user_id: userId }).first();
    if (!item) throw new AppError(404, 'Liability not found');
    return item;
  }

  async create(userId: number, input: Record<string, any>) {
    if (input.metadata) input.metadata = JSON.stringify(input.metadata);
    const [item] = await db('liabilities').insert({ ...input, user_id: userId }).returning('*');
    return item;
  }

  async update(userId: number, id: number, input: Record<string, any>) {
    if (input.metadata) input.metadata = JSON.stringify(input.metadata);
    const [item] = await db('liabilities')
      .where({ id, user_id: userId })
      .update({ ...input, updated_at: db.fn.now() })
      .returning('*');
    if (!item) throw new AppError(404, 'Liability not found');
    return item;
  }

  async delete(userId: number, id: number) {
    const deleted = await db('liabilities').where({ id, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Liability not found');
  }

  async getTotalOutstanding(userId: number): Promise<number> {
    const result = await db('liabilities')
      .where({ user_id: userId })
      .sum('outstanding_amount as total')
      .first();
    return Number(result?.total) || 0;
  }
}

export const liabilitiesService = new LiabilitiesService();
