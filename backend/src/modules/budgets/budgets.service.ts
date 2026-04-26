import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class BudgetsService {
  async getAll(userId: number, year: number, month: number) {
    const budgets = await db('budgets')
      .where({ user_id: userId, year, month })
      .orderBy('category', 'asc');

    // Get actual spending for each budgeted category
    const expenses = await db('expenses')
      .where({ user_id: userId })
      .whereRaw('EXTRACT(YEAR FROM date) = ?', [year])
      .whereRaw('EXTRACT(MONTH FROM date) = ?', [month])
      .select('category')
      .sum('amount as spent')
      .groupBy('category');

    const spendingMap = new Map(expenses.map((e: any) => [e.category, Number(e.spent)]));

    return budgets.map((b: any) => ({
      ...b,
      spent: spendingMap.get(b.category) || 0,
      remaining: Number(b.monthly_limit) - (spendingMap.get(b.category) || 0),
      percentUsed: ((spendingMap.get(b.category) || 0) / Number(b.monthly_limit)) * 100,
    }));
  }

  async create(userId: number, input: { category: string; monthly_limit: number; year: number; month: number; notes?: string }) {
    const existing = await db('budgets')
      .where({ user_id: userId, category: input.category, year: input.year, month: input.month })
      .first();
    if (existing) throw new AppError(409, 'Budget for this category/month already exists');

    const [item] = await db('budgets').insert({ ...input, user_id: userId }).returning('*');
    return item;
  }

  async update(userId: number, id: number, input: Record<string, any>) {
    const [item] = await db('budgets')
      .where({ id, user_id: userId })
      .update({ ...input, updated_at: db.fn.now() })
      .returning('*');
    if (!item) throw new AppError(404, 'Budget not found');
    return item;
  }

  async delete(userId: number, id: number) {
    const deleted = await db('budgets').where({ id, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Budget not found');
  }

  async getSummary(userId: number, year: number, month: number) {
    const budgets = await this.getAll(userId, year, month);
    const totalBudgeted = budgets.reduce((s: number, b: any) => s + Number(b.monthly_limit), 0);
    const totalSpent = budgets.reduce((s: number, b: any) => s + b.spent, 0);
    const overspent = budgets.filter((b: any) => b.spent > Number(b.monthly_limit));

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
      categoriesOverBudget: overspent.length,
      budgets,
    };
  }
}

export const budgetsService = new BudgetsService();
