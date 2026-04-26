import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class CharityService {
  async getAll(userId: number, year?: number) {
    const q = db('charity').where({ user_id: userId }).orderBy('date', 'desc');
    if (year) q.whereRaw('EXTRACT(YEAR FROM date) = ?', [year]);
    return q;
  }

  async getById(userId: number, id: number) {
    const item = await db('charity').where({ id, user_id: userId }).first();
    if (!item) throw new AppError(404, 'Charity record not found');
    return item;
  }

  async create(userId: number, input: Record<string, any>) {
    const [item] = await db('charity').insert({ ...input, user_id: userId }).returning('*');
    return item;
  }

  async update(userId: number, id: number, input: Record<string, any>) {
    const [item] = await db('charity')
      .where({ id, user_id: userId })
      .update({ ...input, updated_at: db.fn.now() })
      .returning('*');
    if (!item) throw new AppError(404, 'Charity record not found');
    return item;
  }

  async delete(userId: number, id: number) {
    const deleted = await db('charity').where({ id, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Charity record not found');
  }

  async getSummary(userId: number, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const records = await this.getAll(userId, targetYear);

    const totals = records.reduce((acc: Record<string, number>, r: any) => {
      acc.total = (acc.total || 0) + Number(r.amount);
      acc[r.type] = (acc[r.type] || 0) + Number(r.amount);
      return acc;
    }, {});

    const byCategory: Record<string, number> = {};
    for (const r of records) {
      byCategory[r.category] = (byCategory[r.category] || 0) + Number(r.amount);
    }

    const zakatPaid = totals.zakat || 0;
    const sadaqahPaid = totals.sadaqah || 0;

    return {
      year: targetYear,
      totalGiven: totals.total || 0,
      zakatPaid,
      sadaqahPaid,
      fitra: totals.fitra || 0,
      qurbani: totals.qurbani || 0,
      lillah: totals.lillah || 0,
      other: totals.other || 0,
      byCategory,
      recordCount: records.length,
      zakatRecords: records.filter((r: any) => r.type === 'zakat'),
    };
  }
}

export const charityService = new CharityService();
