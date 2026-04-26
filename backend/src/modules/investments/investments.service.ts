import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class InvestmentsService {
  async getAll(userId: number) {
    const rows = await db('investments').where({ user_id: userId }).orderBy('ticker', 'asc');
    return rows.map((r: any) => {
      const qty = Number(r.quantity);
      const buy = Number(r.buy_price);
      const cur = Number(r.current_price);
      const invested = qty * buy;
      const market_value = qty * cur;
      const gain = market_value - invested;
      return {
        ...r,
        invested,
        market_value,
        gain_loss: gain,
        gain_loss_percent: invested > 0 ? (gain / invested) * 100 : 0,
      };
    });
  }

  async getById(userId: number, id: number) {
    const item = await db('investments').where({ id, user_id: userId }).first();
    if (!item) throw new AppError(404, 'Investment not found');
    return item;
  }

  async create(userId: number, input: Record<string, any>) {
    const [item] = await db('investments')
      .insert({
        ...input,
        current_price: input.current_price ?? input.buy_price,
        user_id: userId,
      })
      .returning('*');
    return item;
  }

  async update(userId: number, id: number, input: Record<string, any>) {
    const [item] = await db('investments')
      .where({ id, user_id: userId })
      .update({ ...input, updated_at: db.fn.now() })
      .returning('*');
    if (!item) throw new AppError(404, 'Investment not found');
    return item;
  }

  async updatePrice(userId: number, id: number, current_price: number) {
    const [item] = await db('investments')
      .where({ id, user_id: userId })
      .update({ current_price, last_price_update: db.fn.now(), updated_at: db.fn.now() })
      .returning('*');
    if (!item) throw new AppError(404, 'Investment not found');
    return item;
  }

  async delete(userId: number, id: number) {
    const deleted = await db('investments').where({ id, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Investment not found');
  }

  async getSummary(userId: number) {
    const rows = await this.getAll(userId);
    const totalInvested = rows.reduce((s, r) => s + r.invested, 0);
    const totalMarketValue = rows.reduce((s, r) => s + r.market_value, 0);
    const totalGain = totalMarketValue - totalInvested;
    const dseCount = rows.filter((r: any) => r.exchange === 'DSE').length;
    const cseCount = rows.filter((r: any) => r.exchange === 'CSE').length;
    return {
      totalInvested,
      totalMarketValue,
      totalGainLoss: totalGain,
      totalGainPercent: totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0,
      holdingsCount: rows.length,
      dseHoldings: dseCount,
      cseHoldings: cseCount,
    };
  }
}

export const investmentsService = new InvestmentsService();
