const API_BASE_URL = '';

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

export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
  itemCount: number;
  averagePrice: number;
  color: string;
}

export interface PieChartResponse {
  data: PieChartData[];
  total: number;
  totalItems: number;
  metadata: {
    merchantId: string;
    topN: number;
    totalCategories: number;
  };
}

export class SpendingAPI {
  static async getSpendingData(): Promise<SpendingData> {
    try {
      console.log('API Service - getSpendingData - Making request to:', `${API_BASE_URL}/api/spending`);
      const response = await fetch(`${API_BASE_URL}/api/spending`);
      console.log('API Service - getSpendingData - Response status:', response.status);
      console.log('API Service - getSpendingData - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service - getSpendingData - Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Service - getSpendingData - Response data:', data);
      return data;
    } catch (error) {
      console.error('API Service - getSpendingData - Error:', error);
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

  static async getPieChartData(limit?: number, merchantId?: number): Promise<PieChartResponse> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (merchantId) params.append('merchantId', merchantId.toString());
      
      const url = `${API_BASE_URL}/api/pie-chart${params.toString() ? '?' + params.toString() : ''}`;
      console.log('API Service - Making request to:', url);
      console.log('API Service - API_BASE_URL:', API_BASE_URL);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('API Service - Response status:', response.status);
      console.log('API Service - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service - Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Service - Response data:', data);
      return data;
    } catch (error) {
      console.error('API Service - Error fetching pie chart data:', error);
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
