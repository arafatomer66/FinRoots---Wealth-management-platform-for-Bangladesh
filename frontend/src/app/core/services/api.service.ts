import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Assets
  getAssets(params?: Record<string, string>): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/assets`, { params });
  }
  getAsset(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/assets/${id}`);
  }
  createAsset(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/assets`, data);
  }
  updateAsset(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/assets/${id}`, data);
  }
  deleteAsset(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/assets/${id}`);
  }
  getAssetSummary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assets/summary`);
  }

  // Liabilities
  getLiabilities(params?: Record<string, string>): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/liabilities`, { params });
  }
  createLiability(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/liabilities`, data);
  }
  updateLiability(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/liabilities/${id}`, data);
  }
  deleteLiability(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/liabilities/${id}`);
  }

  // Income
  getIncome(params?: Record<string, string>): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/income`, { params });
  }
  createIncome(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/income`, data);
  }
  updateIncome(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/income/${id}`, data);
  }
  deleteIncome(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/income/${id}`);
  }

  // Expenses
  getExpenses(params?: Record<string, string>): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/expenses`, { params });
  }
  createExpense(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/expenses`, data);
  }
  updateExpense(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/expenses/${id}`, data);
  }
  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/expenses/${id}`);
  }

  // Family
  getFamily(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/family`);
  }
  createFamilyMember(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/family`, data);
  }
  updateFamilyMember(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/family/${id}`, data);
  }
  deleteFamilyMember(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/family/${id}`);
  }

  // Inheritance
  calculateInheritance(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inheritance/calculate`, data);
  }
  getEstateValue(): Observable<{ estateValue: number }> {
    return this.http.get<{ estateValue: number }>(`${this.baseUrl}/inheritance/estate-value`);
  }

  // Tax
  calculateTax(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tax/calculate`, data);
  }
  getRebateInvestment(): Observable<{ rebateEligibleInvestment: number }> {
    return this.http.get<{ rebateEligibleInvestment: number }>(`${this.baseUrl}/tax/rebate-investment`);
  }

  // Zakat
  calculateZakat(data: { goldPricePerGram: number; silverPricePerGram: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/zakat/calculate`, data);
  }

  // Goals
  getGoals(params?: Record<string, string>): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/goals`, { params });
  }
  createGoal(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/goals`, data);
  }
  updateGoal(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/goals/${id}`, data);
  }
  deleteGoal(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/goals/${id}`);
  }

  // Budgets
  getBudgets(params?: Record<string, string>): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/budgets`, { params });
  }
  getBudgetSummary(params?: Record<string, string>): Observable<any> {
    return this.http.get(`${this.baseUrl}/budgets/summary`, { params });
  }
  createBudget(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/budgets`, data);
  }
  updateBudget(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/budgets/${id}`, data);
  }
  deleteBudget(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/budgets/${id}`);
  }

  // Documents
  getDocuments(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/documents`);
  }
  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/documents`, formData);
  }
  updateDocument(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/documents/${id}`, data);
  }
  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/documents/${id}`);
  }
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/${id}/download`, { responseType: 'blob' });
  }

  // Export
  exportCsv(type: 'assets' | 'income' | 'expenses' | 'liabilities' | 'full-report'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/${type}`, { responseType: 'blob' });
  }

  // Recurring
  getUpcomingRecurring(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recurring/upcoming`);
  }
  processRecurring(): Observable<any> {
    return this.http.post(`${this.baseUrl}/recurring/process`, {});
  }
  toggleRecurring(type: 'income' | 'expense', id: number, isRecurring: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/recurring/${type}/${id}/toggle`, { is_recurring: isRecurring });
  }

  // Dashboard
  getDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }
  getHealthScore(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/health-score`);
  }
  getIncomeVsExpense(months = 6): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/income-vs-expense`, { params: { months: String(months) } });
  }

  // Investments (DSE/CSE)
  getInvestments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/investments`);
  }
  getInvestmentSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/investments/summary`);
  }
  createInvestment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/investments`, data);
  }
  updateInvestment(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/investments/${id}`, data);
  }
  updateInvestmentPrice(id: number, current_price: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/investments/${id}/price`, { current_price });
  }
  deleteInvestment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/investments/${id}`);
  }

  // Insurance
  getInsurance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/insurance`);
  }
  getInsuranceSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/insurance/summary`);
  }
  createInsurance(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/insurance`, data);
  }
  updateInsurance(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/insurance/${id}`, data);
  }
  deleteInsurance(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/insurance/${id}`);
  }

  // Charity / Sadaqah
  getCharity(year?: number): Observable<any[]> {
    const params: Record<string, string> = year ? { year: String(year) } : {};
    return this.http.get<any[]>(`${this.baseUrl}/charity`, { params });
  }
  getCharitySummary(year?: number): Observable<any> {
    const params: Record<string, string> = year ? { year: String(year) } : {};
    return this.http.get(`${this.baseUrl}/charity/summary`, { params });
  }
  createCharity(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/charity`, data);
  }
  updateCharity(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/charity/${id}`, data);
  }
  deleteCharity(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/charity/${id}`);
  }

  // User Profile
  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/profile`);
  }
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/profile`, data);
  }
}
