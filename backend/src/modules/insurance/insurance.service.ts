import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class InsuranceService {
  async getAll(userId: number) {
    return db('insurance_policies')
      .where({ user_id: userId })
      .orderBy('next_premium_date', 'asc');
  }

  async getById(userId: number, id: number) {
    const item = await db('insurance_policies').where({ id, user_id: userId }).first();
    if (!item) throw new AppError(404, 'Insurance policy not found');
    return item;
  }

  async create(userId: number, input: Record<string, any>) {
    const next_premium_date = input.next_premium_date || this.calcNextPremium(input.start_date, input.premium_frequency);
    const [item] = await db('insurance_policies')
      .insert({ ...input, next_premium_date, user_id: userId })
      .returning('*');
    return item;
  }

  async update(userId: number, id: number, input: Record<string, any>) {
    const [item] = await db('insurance_policies')
      .where({ id, user_id: userId })
      .update({ ...input, updated_at: db.fn.now() })
      .returning('*');
    if (!item) throw new AppError(404, 'Insurance policy not found');
    return item;
  }

  async delete(userId: number, id: number) {
    const deleted = await db('insurance_policies').where({ id, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Insurance policy not found');
  }

  async getSummary(userId: number) {
    const policies = await this.getAll(userId);
    const totalSumAssured = policies.reduce((s: number, p: any) => s + Number(p.sum_assured), 0);
    const annualPremium = policies.reduce((s: number, p: any) => s + this.toAnnualPremium(Number(p.premium), p.premium_frequency), 0);
    const today = new Date();
    const next30 = new Date();
    next30.setDate(today.getDate() + 30);
    const upcomingPremiums = policies.filter((p: any) =>
      p.next_premium_date && new Date(p.next_premium_date) <= next30 && new Date(p.next_premium_date) >= today
    );
    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter((p: any) => p.is_active).length,
      totalSumAssured,
      annualPremium,
      upcomingPremiums,
      byType: this.groupByType(policies),
    };
  }

  private toAnnualPremium(premium: number, frequency: string): number {
    switch (frequency) {
      case 'monthly': return premium * 12;
      case 'quarterly': return premium * 4;
      case 'half_yearly': return premium * 2;
      case 'yearly': return premium;
      case 'one_time': return 0;
      default: return premium;
    }
  }

  private groupByType(policies: any[]) {
    const groups: Record<string, { count: number; sumAssured: number }> = {};
    for (const p of policies) {
      if (!groups[p.type]) groups[p.type] = { count: 0, sumAssured: 0 };
      groups[p.type].count += 1;
      groups[p.type].sumAssured += Number(p.sum_assured);
    }
    return groups;
  }

  private calcNextPremium(start: string, frequency: string): string | null {
    if (!start || frequency === 'one_time') return null;
    const d = new Date(start);
    switch (frequency) {
      case 'monthly': d.setMonth(d.getMonth() + 1); break;
      case 'quarterly': d.setMonth(d.getMonth() + 3); break;
      case 'half_yearly': d.setMonth(d.getMonth() + 6); break;
      case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    }
    return d.toISOString().slice(0, 10);
  }
}

export const insuranceService = new InsuranceService();
