import db from '../../config/database';
import { ZAKAT_CONFIG } from '../../config/constants';

interface ZakatableAsset {
  category: string;
  description: string;
  value: number;
  isZakatable: boolean;
}

interface ZakatResult {
  nisabGold: number;
  nisabSilver: number;
  nisabThresholdBDT: number;
  totalZakatableWealth: number;
  totalDeductions: number;
  netZakatableWealth: number;
  isEligible: boolean;
  zakatDue: number;
  breakdown: ZakatableAsset[];
}

export class ZakatService {
  async calculate(userId: number, goldPricePerGram: number, silverPricePerGram: number): Promise<ZakatResult> {
    // Nisab thresholds in BDT
    const nisabGold = ZAKAT_CONFIG.nisab.goldGrams * goldPricePerGram;
    const nisabSilver = ZAKAT_CONFIG.nisab.silverGrams * silverPricePerGram;
    const nisabThresholdBDT = Math.min(nisabGold, nisabSilver); // Use lower

    // Fetch all active assets
    const assets = await db('assets').where({ user_id: userId, status: 'active' });
    const liabilities = await db('liabilities').where({ user_id: userId });

    const breakdown: ZakatableAsset[] = [];
    let totalZakatable = 0;

    for (const asset of assets) {
      const zakatable = this.isZakatable(asset.asset_type);
      const value = Number(asset.current_value);

      breakdown.push({
        category: asset.asset_type,
        description: asset.name,
        value,
        isZakatable: zakatable,
      });

      if (zakatable) totalZakatable += value;
    }

    // Deduct immediate liabilities
    const totalDeductions = liabilities.reduce((sum: number, l: any) => {
      // Only deduct immediate/short-term debts for zakat
      return sum + Number(l.emi_amount || 0); // Monthly EMI as immediate obligation
    }, 0);

    const netZakatableWealth = Math.max(0, totalZakatable - totalDeductions);
    const isEligible = netZakatableWealth >= nisabThresholdBDT;
    const zakatDue = isEligible ? netZakatableWealth * ZAKAT_CONFIG.rate : 0;

    return {
      nisabGold,
      nisabSilver,
      nisabThresholdBDT,
      totalZakatableWealth: totalZakatable,
      totalDeductions,
      netZakatableWealth,
      isEligible,
      zakatDue,
      breakdown,
    };
  }

  private isZakatable(assetType: string): boolean {
    // Zakatable: cash, gold, silver, stocks, mutual funds, business inventory
    // Not zakatable: real estate (personal use), insurance, personal vehicle
    const zakatableTypes = ['cash_bank', 'gold', 'stock', 'mutual_fund', 'fdr', 'dps', 'sanchayapatra', 'bond'];
    return zakatableTypes.includes(assetType);
  }
}

export const zakatService = new ZakatService();
