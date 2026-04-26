import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { calculateMuslimInheritance } from './calculators/muslim.calculator';
import { calculateHinduInheritance } from './calculators/hindu.calculator';
import { calculateChristianInheritance } from './calculators/christian.calculator';

export class InheritanceService {
  async calculate(userId: number, planData: {
    successionLaw: 'muslim' | 'hindu' | 'christian';
    estateValue: number;
    willAmount?: number;
    hasWill?: boolean;
    willDistribution?: { memberId: number; percentage: number }[];
  }) {
    const familyMembers = await db('family_members').where({ user_id: userId });

    if (familyMembers.length === 0) {
      throw new AppError(400, 'Add family members before calculating inheritance');
    }

    switch (planData.successionLaw) {
      case 'muslim':
        return calculateMuslimInheritance(
          planData.estateValue,
          familyMembers,
          planData.willAmount,
        );

      case 'hindu':
        return calculateHinduInheritance(
          planData.estateValue,
          familyMembers,
          planData.hasWill,
          planData.willDistribution,
        );

      case 'christian':
        return calculateChristianInheritance(
          planData.estateValue,
          familyMembers,
          planData.hasWill,
          planData.willDistribution,
        );

      default:
        throw new AppError(400, 'Invalid succession law type');
    }
  }

  async getEstateValue(userId: number): Promise<number> {
    const result = await db('assets')
      .where({ user_id: userId, status: 'active' })
      .sum('current_value as total')
      .first();
    return Number(result?.total) || 0;
  }

  // Inheritance plan CRUD
  async getPlans(userId: number) {
    return db('inheritance_plans').where({ user_id: userId }).orderBy('created_at', 'desc');
  }

  async getPlanById(userId: number, planId: number) {
    const plan = await db('inheritance_plans').where({ id: planId, user_id: userId }).first();
    if (!plan) throw new AppError(404, 'Plan not found');

    const shares = await db('inheritance_shares')
      .where({ plan_id: planId })
      .join('family_members', 'inheritance_shares.family_member_id', 'family_members.id')
      .select('inheritance_shares.*', 'family_members.name', 'family_members.relationship');

    return { ...plan, shares };
  }

  async savePlan(userId: number, planData: Record<string, any>) {
    const [plan] = await db('inheritance_plans')
      .insert({
        user_id: userId,
        plan_name: planData.plan_name,
        succession_law: planData.succession_law,
        will_text: planData.will_text,
        total_estate_value: planData.total_estate_value,
        status: planData.status || 'draft',
      })
      .returning('*');

    // Save shares
    if (planData.shares?.length) {
      const shareRows = planData.shares.map((s: any) => ({
        plan_id: plan.id,
        family_member_id: s.memberId,
        share_percentage: s.percentage,
        share_amount: s.amount,
        notes: s.basis,
      }));
      await db('inheritance_shares').insert(shareRows);
    }

    return plan;
  }

  async deletePlan(userId: number, planId: number) {
    await db('inheritance_shares').where({ plan_id: planId }).del();
    const deleted = await db('inheritance_plans').where({ id: planId, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Plan not found');
  }
}

export const inheritanceService = new InheritanceService();
