import db from '../../config/database';

export class DashboardService {
  async getNetWorth(userId: number) {
    const [assets, liabilities] = await Promise.all([
      db('assets')
        .where({ user_id: userId, status: 'active' })
        .sum('current_value as total')
        .first(),
      db('liabilities')
        .where({ user_id: userId })
        .sum('outstanding_amount as total')
        .first(),
    ]);

    const totalAssets = Number(assets?.total) || 0;
    const totalLiabilities = Number(liabilities?.total) || 0;

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    };
  }

  async getAssetAllocation(userId: number) {
    return db('assets')
      .where({ user_id: userId, status: 'active' })
      .select('asset_type')
      .sum('current_value as total_value')
      .count('* as count')
      .groupBy('asset_type')
      .orderBy('total_value', 'desc');
  }

  async getUpcomingMaturities(userId: number, daysAhead: number = 90) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return db('assets')
      .where({ user_id: userId, status: 'active' })
      .whereNotNull('maturity_date')
      .where('maturity_date', '>=', new Date())
      .where('maturity_date', '<=', futureDate)
      .orderBy('maturity_date', 'asc');
  }

  async getMonthlyCashflow(userId: number) {
    const incomeEntries = await db('income').where({ user_id: userId });
    const now = new Date();

    let monthlyIncome = 0;
    for (const entry of incomeEntries) {
      const amount = Number(entry.amount);
      switch (entry.frequency) {
        case 'monthly': monthlyIncome += amount; break;
        case 'quarterly': monthlyIncome += amount / 3; break;
        case 'yearly': monthlyIncome += amount / 12; break;
      }
    }

    const monthlyExpenses = await db('expenses')
      .where({ user_id: userId })
      .whereRaw('EXTRACT(YEAR FROM date) = ?', [now.getFullYear()])
      .whereRaw('EXTRACT(MONTH FROM date) = ?', [now.getMonth() + 1])
      .sum('amount as total')
      .first();

    return {
      monthlyIncome,
      monthlyExpenses: Number(monthlyExpenses?.total) || 0,
      netCashflow: monthlyIncome - (Number(monthlyExpenses?.total) || 0),
    };
  }

  async getGoalProgress(userId: number) {
    return db('goals')
      .where({ user_id: userId })
      .select('*')
      .orderBy('target_date', 'asc');
  }

  async getHealthScore(userId: number) {
    const [netWorth, cashflow, goals, emergencyGoal] = await Promise.all([
      this.getNetWorth(userId),
      this.getMonthlyCashflow(userId),
      db('goals').where({ user_id: userId }),
      db('goals').where({ user_id: userId, category: 'emergency' }).first(),
    ]);

    // 1. Savings rate (0-25 pts)
    const savingsRate = cashflow.monthlyIncome > 0
      ? ((cashflow.monthlyIncome - cashflow.monthlyExpenses) / cashflow.monthlyIncome) * 100 : 0;
    const savingsScore = Math.min(25, (savingsRate / 20) * 25); // 20%+ savings = full marks

    // 2. Debt-to-asset ratio (0-25 pts)
    const debtRatio = netWorth.totalAssets > 0
      ? (netWorth.totalLiabilities / netWorth.totalAssets) * 100 : 0;
    const debtScore = debtRatio <= 0 ? 25 : Math.max(0, 25 - (debtRatio / 4));

    // 3. Emergency fund (0-25 pts) — 6 months expenses
    const monthlyExpense = cashflow.monthlyExpenses || cashflow.monthlyIncome * 0.5;
    const targetEmergency = monthlyExpense * 6;
    const currentEmergency = emergencyGoal ? Number(emergencyGoal.current_amount) : 0;
    const emergencyScore = targetEmergency > 0
      ? Math.min(25, (currentEmergency / targetEmergency) * 25) : 12;

    // 4. Goal progress (0-25 pts)
    let goalScore = 12;
    if (goals.length > 0) {
      const avgProgress = goals.reduce((s: number, g: any) => {
        const pct = Number(g.target_amount) > 0 ? (Number(g.current_amount) / Number(g.target_amount)) * 100 : 0;
        return s + Math.min(100, pct);
      }, 0) / goals.length;
      goalScore = (avgProgress / 100) * 25;
    }

    const totalScore = Math.round(savingsScore + debtScore + emergencyScore + goalScore);

    return {
      score: Math.min(100, totalScore),
      grade: totalScore >= 80 ? 'A' : totalScore >= 60 ? 'B' : totalScore >= 40 ? 'C' : 'D',
      breakdown: {
        savingsRate: { score: Math.round(savingsScore), max: 25, value: Math.round(savingsRate) },
        debtRatio: { score: Math.round(debtScore), max: 25, value: Math.round(debtRatio) },
        emergencyFund: { score: Math.round(emergencyScore), max: 25, months: targetEmergency > 0 ? Math.round((currentEmergency / monthlyExpense) * 10) / 10 : 0 },
        goalProgress: { score: Math.round(goalScore), max: 25, activeGoals: goals.length },
      },
    };
  }

  async getIncomeVsExpense(userId: number, months = 6) {
    const result = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const [incomeRes, expenseRes] = await Promise.all([
        db('income').where({ user_id: userId }).select('amount', 'frequency'),
        db('expenses').where({ user_id: userId })
          .whereRaw('EXTRACT(YEAR FROM date) = ?', [year])
          .whereRaw('EXTRACT(MONTH FROM date) = ?', [month])
          .sum('amount as total').first(),
      ]);

      let monthlyIncome = 0;
      for (const entry of incomeRes) {
        const amount = Number(entry.amount);
        switch (entry.frequency) {
          case 'monthly': monthlyIncome += amount; break;
          case 'quarterly': monthlyIncome += amount / 3; break;
          case 'yearly': monthlyIncome += amount / 12; break;
        }
      }

      result.push({
        month: d.toLocaleString('en', { month: 'short' }),
        year,
        income: Math.round(monthlyIncome),
        expenses: Number(expenseRes?.total) || 0,
      });
    }
    return result;
  }

  async getFullDashboard(userId: number) {
    const [netWorth, allocation, maturities, cashflow, goals, healthScore] = await Promise.all([
      this.getNetWorth(userId),
      this.getAssetAllocation(userId),
      this.getUpcomingMaturities(userId),
      this.getMonthlyCashflow(userId),
      this.getGoalProgress(userId),
      this.getHealthScore(userId),
    ]);

    return { netWorth, allocation, maturities, cashflow, goals, healthScore };
  }
}

export const dashboardService = new DashboardService();
