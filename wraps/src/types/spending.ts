export interface PaymentMethod {
  externalId: string;
  type: string;
  brand: string;
  lastFour: string;
  transactionAmount: string;
}

export interface Adjustment {
  type: 'DISCOUNT' | 'FEE' | 'TAX' | 'TIP';
  label: string;
  amount: number;
}

export interface Price {
  subTotal: number;
  adjustments?: Adjustment[];
  total: number;
  currency: string;
}

export interface ProductPrice {
  subTotal: number;
  total: number;
  currency: string;
  unitPrice: number;
}

export interface Product {
  externalId: string;
  name: string;
  url: string;
  quantity: number;
  price: ProductPrice;
  eligibility: string[];
}

export interface Transaction {
  externalId: string;
  dateTime: string;
  url: string;
  orderStatus: string;
  paymentMethods: PaymentMethod[];
  price: Price;
  products: Product[];
}

// Summary interfaces
export interface MerchantSummary {
  merchantId: number;
  merchantName: string;
  totalSpent: number;
  transactionCount: number;
  averageOrderValue: number;
  categoryBreakdown: CategoryBreakdown[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  monthlySpending: MonthlySpending[];
}

export interface CategoryBreakdown {
  category: string;
  totalSpent: number;
  itemCount: number;
  averagePrice: number;
  topProducts: ProductSummary[];
}

export interface ProductSummary {
  name: string;
  totalSpent: number;
  quantity: number;
  averagePrice: number;
}

export interface PaymentMethodBreakdown {
  brand: string;
  totalSpent: number;
  transactionCount: number;
  lastFour: string;
}

export interface MonthlySpending {
  month: string;
  totalSpent: number;
  transactionCount: number;
}

export interface SpendingSummary {
  totalSpent: number;
  totalTransactions: number;
  averageOrderValue: number;
  merchantSummaries: MerchantSummary[];
  topCategories: CategoryBreakdown[];
  monthlyTrends: MonthlySpending[];
  paymentMethodSummary: PaymentMethodBreakdown[];
}
