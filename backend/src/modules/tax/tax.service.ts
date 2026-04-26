import db from '../../config/database';
import { TAX_CONFIG } from '../../config/constants';

interface TaxPayer {
  gender?: string;
  date_of_birth?: string;
  is_disabled?: boolean;
  is_third_gender?: boolean;
  is_freedom_fighter?: boolean;
  is_new_taxpayer?: boolean;
}

interface TaxResult {
  assessmentYear: string;
  totalIncome: number;
  taxFreeThreshold: number;
  taxableIncome: number;
  slabBreakdown: { slab: string; amount: number; rate: number; tax: number }[];
  grossTax: number;
  investmentRebate: number;
  netTax: number;
  minimumTax: number;
  finalTax: number;
}

export class TaxService {
  calculateTax(totalIncome: number, taxpayer: TaxPayer, totalInvestment: number = 0): TaxResult {
    const taxFreeThreshold = this.getTaxFreeThreshold(taxpayer);
    const taxableIncome = Math.max(0, totalIncome - taxFreeThreshold);

    const slabBreakdown: TaxResult['slabBreakdown'] = [];
    let remaining = taxableIncome;
    let grossTax = 0;
    let prevLimit = 0;

    for (const slab of TAX_CONFIG.slabs) {
      if (remaining <= 0) break;
      const slabWidth = slab.upTo === Infinity ? remaining : slab.upTo - prevLimit;
      const taxableInSlab = Math.min(remaining, slabWidth);
      const taxForSlab = taxableInSlab * slab.rate;

      slabBreakdown.push({
        slab: slab.upTo === Infinity ? `Above ৳${prevLimit.toLocaleString()}` : `৳${prevLimit.toLocaleString()} - ৳${slab.upTo.toLocaleString()}`,
        amount: taxableInSlab,
        rate: slab.rate,
        tax: taxForSlab,
      });

      grossTax += taxForSlab;
      remaining -= taxableInSlab;
      prevLimit = slab.upTo === Infinity ? prevLimit : slab.upTo;
    }

    // Investment rebate: 15% of allowable investment (capped)
    const allowableInvestment = Math.min(totalInvestment, TAX_CONFIG.investmentRebate.maxAllowable);
    const investmentRebate = Math.min(
      allowableInvestment * TAX_CONFIG.investmentRebate.rate,
      grossTax,
    );

    const netTax = grossTax - investmentRebate;
    const minimumTax = taxpayer.is_new_taxpayer
      ? TAX_CONFIG.minimumTax.newTaxpayer
      : TAX_CONFIG.minimumTax.existing;

    // Final tax is the higher of net tax and minimum tax (if income exceeds threshold)
    const finalTax = taxableIncome > 0 ? Math.max(netTax, minimumTax) : 0;

    return {
      assessmentYear: TAX_CONFIG.assessmentYear,
      totalIncome,
      taxFreeThreshold,
      taxableIncome,
      slabBreakdown,
      grossTax,
      investmentRebate,
      netTax,
      minimumTax,
      finalTax,
    };
  }

  private getTaxFreeThreshold(taxpayer: TaxPayer): number {
    if (taxpayer.is_disabled) return TAX_CONFIG.taxFreeIncome.disabled;
    if (taxpayer.is_third_gender) return TAX_CONFIG.taxFreeIncome.thirdGender;
    if (taxpayer.is_freedom_fighter) return TAX_CONFIG.taxFreeIncome.gazetteWarHero;

    if (taxpayer.gender === 'female') return TAX_CONFIG.taxFreeIncome.female;

    if (taxpayer.date_of_birth) {
      const age = this.calculateAge(new Date(taxpayer.date_of_birth));
      if (age >= 65) return TAX_CONFIG.taxFreeIncome.senior65Plus;
    }

    return TAX_CONFIG.taxFreeIncome.general;
  }

  // Calculate rebate-eligible investment total from user's assets
  async getRebateEligibleInvestment(userId: number): Promise<number> {
    const rebateTypes = ['sanchayapatra', 'dps', 'insurance', 'mutual_fund'];
    const result = await db('assets')
      .where({ user_id: userId, status: 'active' })
      .whereIn('asset_type', rebateTypes)
      .sum('current_value as total')
      .first();
    return Number(result?.total) || 0;
  }

  async saveTaxFiling(userId: number, data: Record<string, any>) {
    const [filing] = await db('tax_filings').insert({ ...data, user_id: userId }).returning('*');
    return filing;
  }

  async getTaxFilings(userId: number) {
    return db('tax_filings').where({ user_id: userId }).orderBy('assessment_year', 'desc');
  }

  private calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }
}

export const taxService = new TaxService();
