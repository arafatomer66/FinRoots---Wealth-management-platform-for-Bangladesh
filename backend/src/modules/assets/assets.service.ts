import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { AssetType } from '../../config/constants';
import { PaginationParams, PaginatedResult } from '../../utils/pagination';

export interface AssetInput {
  asset_type: AssetType;
  name: string;
  institution?: string;
  purchase_date?: string;
  maturity_date?: string;
  purchase_value?: number;
  current_value: number;
  interest_rate?: number;
  metadata?: Record<string, any>;
  nominee_id?: number;
  notes?: string;
  status?: string;
}

export class AssetsService {
  async getAll(userId: number, filters?: { asset_type?: string; status?: string }, pagination?: PaginationParams): Promise<PaginatedResult<any>> {
    const query = db('assets').where({ user_id: userId });
    if (filters?.asset_type) query.andWhere({ asset_type: filters.asset_type });
    if (filters?.status) query.andWhere({ status: filters.status });

    const countQuery = query.clone().count('* as total').first();
    const dataQuery = query.clone().orderBy('created_at', 'desc');

    if (pagination) {
      dataQuery.limit(pagination.limit).offset(pagination.offset);
    }

    const [data, countResult] = await Promise.all([dataQuery, countQuery]);
    const total = Number(countResult?.total) || 0;

    return {
      data,
      pagination: {
        page: pagination?.page || 1,
        limit: pagination?.limit || total,
        total,
        totalPages: pagination ? Math.ceil(total / pagination.limit) : 1,
      },
    };
  }

  async getById(userId: number, assetId: number) {
    const asset = await db('assets').where({ id: assetId, user_id: userId }).first();
    if (!asset) throw new AppError(404, 'Asset not found');
    return asset;
  }

  async create(userId: number, input: AssetInput) {
    const [asset] = await db('assets')
      .insert({
        user_id: userId,
        asset_type: input.asset_type,
        name: input.name,
        institution: input.institution,
        purchase_date: input.purchase_date,
        maturity_date: input.maturity_date,
        purchase_value: input.purchase_value,
        current_value: input.current_value,
        interest_rate: input.interest_rate,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        nominee_id: input.nominee_id,
        notes: input.notes,
        status: input.status || 'active',
      })
      .returning('*');
    return asset;
  }

  async update(userId: number, assetId: number, input: Partial<AssetInput>) {
    const existing = await this.getById(userId, assetId);
    if (!existing) throw new AppError(404, 'Asset not found');

    const updates: Record<string, any> = { ...input, updated_at: db.fn.now() };
    if (updates.metadata) updates.metadata = JSON.stringify(updates.metadata);

    const [asset] = await db('assets')
      .where({ id: assetId, user_id: userId })
      .update(updates)
      .returning('*');
    return asset;
  }

  async delete(userId: number, assetId: number) {
    const deleted = await db('assets').where({ id: assetId, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Asset not found');
  }

  async getSummary(userId: number) {
    const assets = await db('assets')
      .where({ user_id: userId, status: 'active' })
      .select('asset_type', db.raw('SUM(current_value) as total_value'), db.raw('COUNT(*) as count'))
      .groupBy('asset_type');
    return assets;
  }
}

export const assetsService = new AssetsService();
