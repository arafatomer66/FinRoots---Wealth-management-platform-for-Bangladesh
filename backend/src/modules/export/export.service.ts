import db from '../../config/database';

export class ExportService {
  async getAssetsCsv(userId: number): Promise<string> {
    const assets = await db('assets').where({ user_id: userId }).orderBy('asset_type');
    const headers = ['Name', 'Type', 'Institution', 'Current Value', 'Purchase Value', 'Status', 'Maturity Date'];
    const rows = assets.map((a: any) => [
      a.name, a.asset_type, a.institution || '', a.current_value, a.purchase_value || '', a.status, a.maturity_date || '',
    ]);
    return [headers.join(','), ...rows.map(r => r.map((v: any) => `"${v}"`).join(','))].join('\n');
  }

  async getIncomeCsv(userId: number): Promise<string> {
    const items = await db('income').where({ user_id: userId }).orderBy('created_at', 'desc');
    const headers = ['Source', 'Type', 'Amount', 'Frequency', 'Taxable', 'Start Date', 'End Date'];
    const rows = items.map((i: any) => [
      i.source, i.type, i.amount, i.frequency, i.is_taxable ? 'Yes' : 'No', i.start_date || '', i.end_date || '',
    ]);
    return [headers.join(','), ...rows.map(r => r.map((v: any) => `"${v}"`).join(','))].join('\n');
  }

  async getExpensesCsv(userId: number): Promise<string> {
    const items = await db('expenses').where({ user_id: userId }).orderBy('date', 'desc');
    const headers = ['Date', 'Category', 'Amount', 'Frequency', 'Notes'];
    const rows = items.map((e: any) => [
      e.date, e.category, e.amount, e.frequency, e.notes || '',
    ]);
    return [headers.join(','), ...rows.map(r => r.map((v: any) => `"${v}"`).join(','))].join('\n');
  }

  async getLiabilitiesCsv(userId: number): Promise<string> {
    const items = await db('liabilities').where({ user_id: userId });
    const headers = ['Name', 'Type', 'Institution', 'Original Amount', 'Outstanding Amount', 'Interest Rate', 'EMI'];
    const rows = items.map((l: any) => [
      l.name, l.type, l.institution || '', l.original_amount, l.outstanding_amount, l.interest_rate || '', l.emi_amount || '',
    ]);
    return [headers.join(','), ...rows.map(r => r.map((v: any) => `"${v}"`).join(','))].join('\n');
  }

  async getFullReportCsv(userId: number): Promise<string> {
    const [assets, liabilities, income, expenses] = await Promise.all([
      this.getAssetsCsv(userId),
      this.getLiabilitiesCsv(userId),
      this.getIncomeCsv(userId),
      this.getExpensesCsv(userId),
    ]);

    return [
      '=== ASSETS ===', assets, '',
      '=== LIABILITIES ===', liabilities, '',
      '=== INCOME ===', income, '',
      '=== EXPENSES ===', expenses,
    ].join('\n');
  }
}

export const exportService = new ExportService();
