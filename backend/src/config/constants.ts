// Bangladesh Tax Slabs — NBR 2025-26 (Assessment Year 2026-27)
export const TAX_CONFIG = {
  assessmentYear: '2026-27',
  incomeYear: '2025-26',

  // Tax-free thresholds
  taxFreeIncome: {
    general: 375000,
    female: 425000,
    senior65Plus: 425000,
    disabled: 500000,
    thirdGender: 500000,
    gazetteWarHero: 500000,
  },

  // Progressive tax slabs (applied on income above tax-free threshold)
  slabs: [
    { upTo: 100000, rate: 0.05 },   // First 1,00,000 → 5%
    { upTo: 400000, rate: 0.10 },   // Next 3,00,000 → 10%
    { upTo: 700000, rate: 0.15 },   // Next 4,00,000 → 15%
    { upTo: 1100000, rate: 0.20 },  // Next 5,00,000 → 20%
    { upTo: 2000000, rate: 0.25 },  // Next 5,00,000 → 25%
    { upTo: Infinity, rate: 0.30 }, // Remaining → 30%
  ],

  // Minimum tax
  minimumTax: {
    existing: 5000,
    newTaxpayer: 1000,
  },

  // Investment rebate
  investmentRebate: {
    rate: 0.15, // 15% of allowable investment
    maxAllowable: 10000000, // ৳1 crore
  },

  // Surcharge on net wealth
  surcharge: [
    { netWorthAbove: 40000000, rate: 0.10 },  // 4 crore → 10%
    { netWorthAbove: 100000000, rate: 0.20 }, // 10 crore → 20%
    { netWorthAbove: 200000000, rate: 0.30 }, // 20 crore → 30%
    { netWorthAbove: 500000000, rate: 0.35 }, // 50 crore → 35%
  ],
};

// Zakat Configuration
export const ZAKAT_CONFIG = {
  // Nisab thresholds (in grams)
  nisab: {
    goldGrams: 87.48,
    silverGrams: 612.36,
  },
  rate: 0.025, // 2.5%
  agriculturalRates: {
    irrigated: 0.05,   // 5% — farmer-irrigated
    rainFed: 0.10,     // 10% — rain-irrigated
  },
  lunarYearDays: 354,
};

// Sanchayapatra (Government Savings Certificates) — Rates as of July 2025
export const SANCHAYAPATRA_CONFIG = {
  types: [
    {
      key: 'five_year_bd',
      name: '5-Year Bangladesh Savings Certificate',
      nameBn: '৫ বছর মেয়াদি বাংলাদেশ সঞ্চয়পত্র',
      tenure: 5,
      rates: {
        upTo750000: 0.1183,
        above750000: 0.1180,
      },
    },
    {
      key: 'three_month_profit',
      name: '3-Month Profit-Bearing Sanchayapatra',
      nameBn: '৩ মাস অন্তর মুনাফাভিত্তিক সঞ্চয়পত্র',
      tenure: 3,
      rates: {
        upTo750000: 0.1230,
        above750000: 0.1225,
      },
    },
    {
      key: 'family',
      name: 'Family Savings Certificate (Paribar)',
      nameBn: 'পরিবার সঞ্চয়পত্র',
      tenure: 5,
      rates: {
        upTo750000: 0.1250,
        above750000: 0.1237,
      },
    },
    {
      key: 'pensioners',
      name: "Pensioners' Savings Certificate",
      nameBn: 'পেনশনার সঞ্চয়পত্র',
      tenure: 5,
      rates: {
        upTo750000: 0.1255,
        above750000: 0.1237,
      },
    },
  ],
  tierThreshold: 750000, // ৳7.5 lakh
  taxRebateEligible: true,
};

// Asset Types
export const ASSET_TYPES = [
  'sanchayapatra',
  'fdr',
  'dps',
  'stock',
  'mutual_fund',
  'gold',
  'real_estate',
  'insurance',
  'bond',
  'cash_bank',
  'other',
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

// Liability Types
export const LIABILITY_TYPES = [
  'home_loan',
  'personal_loan',
  'car_loan',
  'credit_card',
  'education_loan',
  'business_loan',
  'other',
] as const;

// Income Types
export const INCOME_TYPES = [
  'salary',
  'business',
  'rental',
  'dividend',
  'interest',
  'freelance',
  'agricultural',
  'capital_gain',
  'other',
] as const;

// Relationships for Family Members
export const RELATIONSHIPS = [
  'spouse',
  'son',
  'daughter',
  'father',
  'mother',
  'brother',
  'sister',
  'grandfather',
  'grandmother',
  'grandson',
  'granddaughter',
  'uncle',
  'aunt',
  'nephew',
  'niece',
  'other',
] as const;

// Religions (for inheritance law selection)
export const RELIGIONS = [
  'muslim',
  'hindu',
  'christian',
  'buddhist',
  'other',
] as const;

// Goal Categories
export const GOAL_CATEGORIES = [
  'retirement',
  'education',
  'housing',
  'emergency',
  'hajj',
  'marriage',
  'vehicle',
  'travel',
  'business',
  'other',
] as const;
