const API_BASE_URL = 'http://localhost:3001';

export interface SpendingData {
  totalSpent: number;
  totalTransactions: number;
  averageOrderValue: number;
  merchantSummaries: MerchantSummary[];
  topCategories: CategorySummary[];
  monthlyTrends: MonthlyTrend[];
  paymentMethodSummary: PaymentMethod[];
}

export interface MerchantSummary {
  merchantId: number;
  merchantName: string;
  totalSpent: number;
  transactionCount: number;
  averageOrderValue: number;
  categoryBreakdown: CategoryBreakdown[];
  paymentMethodBreakdown: PaymentMethod[];
  monthlySpending: MonthlySpending[];
}

export interface CategorySummary {
  category: string;
  totalSpent: number;
  itemCount: number;
  averagePrice: number;
  topProducts: Product[];
}

export interface CategoryBreakdown {
  category: string;
  totalSpent: number;
  itemCount: number;
  averagePrice: number;
  topProducts: Product[];
}

export interface Product {
  name: string;
  totalSpent: number;
  quantity: number;
  averagePrice: number;
}

export interface PaymentMethod {
  brand: string;
  totalSpent: number;
  transactionCount: number;
  lastFour: string;
}

export interface MonthlyTrend {
  month: string;
  totalSpent: number;
  transactionCount: number;
}

export interface MonthlySpending {
  month: string;
  totalSpent: number;
  transactionCount: number;
}

export class SpendingAPI {
  static async getSpendingData(): Promise<SpendingData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/spending`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching spending data:', error);
      throw error;
    }
  }

  static async getMerchants() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchants`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching merchants:', error);
      throw error;
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  static formatMonth(monthString: string): string {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}
