export type TransactionType = 'income' | 'expense';
export type ProfileType = 'personal' | 'business';
export type TransactionStatus = 'pending' | 'completed';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'transfer' | 'bill';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
  user_id?: string | null;
}

export interface CreditCard {
  id: string;
  name: string;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  color: string;
  user_id: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string (Purchase Date)
  invoice_date?: string; // ISO string (Invoice Due Date - for Credit Cards)
  profile: ProfileType;
  status: TransactionStatus;
  payment_method: PaymentMethod;
  user_id?: string;
  
  // Credit Card Fields
  card_id?: string;
  installment_number?: number;
  total_installments?: number;
}

export interface FinanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyBalance: number;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'bill', label: 'Boleto' },
];
