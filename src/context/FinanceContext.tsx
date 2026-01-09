import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction, ProfileType, Category, CreditCard } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { generateInstallments } from '../utils/cardLogic';
import { startOfMonth, endOfMonth } from 'date-fns';

interface FinanceContextData {
  transactions: Transaction[];
  currentProfile: ProfileType;
  categories: Category[];
  cards: CreditCard[];
  isLoading: boolean;
  switchProfile: (profile: ProfileType) => void;
  addTransaction: (transaction: any) => Promise<void>;
  editTransaction: (id: string, transaction: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addCard: (card: Omit<CreditCard, 'id' | 'user_id'>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  payInvoice: (cardId: string, invoiceDate: Date) => Promise<void>;
  getSummary: () => any;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

const PROFILE_KEY = '@finance-dashboard:profile-v1';

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ProfileType>('personal');
  const [isLoading, setIsLoading] = useState(true);

  // --- CARREGAMENTO DE DADOS ---
  useEffect(() => {
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    if (storedProfile) setCurrentProfile(storedProfile as ProfileType);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) {
      setTransactions([]); setCategories([]); setCards([]); setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const [transRes, catRes, cardRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('credit_cards').select('*')
      ]);

      if (transRes.error) throw transRes.error;
      if (catRes.error) throw catRes.error;
      if (cardRes.error) throw cardRes.error;

      setTransactions(transRes.data as Transaction[]);
      setCategories(catRes.data as Category[]);
      setCards(cardRes.data as CreditCard[]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, currentProfile);
  }, [currentProfile]);

  const switchProfile = (profile: ProfileType) => setCurrentProfile(profile);

  // --- LÓGICA DE CARTÕES ---
  const addCard = async (data: Omit<CreditCard, 'id' | 'user_id'>) => {
    if (!user) return;
    const { data: newCard, error } = await supabase
      .from('credit_cards')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    if (newCard) setCards(prev => [...prev, newCard]);
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from('credit_cards').delete().eq('id', id);
    if (error) throw error;
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const payInvoice = async (cardId: string, invoiceDate: Date) => {
    if (!user) return;

    const start = startOfMonth(invoiceDate).toISOString();
    const end = endOfMonth(invoiceDate).toISOString();

    const { error } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('card_id', cardId)
      .eq('status', 'pending')
      .gte('invoice_date', start)
      .lte('invoice_date', end);

    if (error) throw error;

    setTransactions(prev => prev.map(t => {
      if (t.card_id === cardId && t.invoice_date && t.status === 'pending') {
        const tDate = new Date(t.invoice_date);
        if (tDate.getMonth() === invoiceDate.getMonth() && tDate.getFullYear() === invoiceDate.getFullYear()) {
          return { ...t, status: 'completed' };
        }
      }
      return t;
    }));
  };

  // --- LÓGICA DE TRANSAÇÕES ---

  const addTransaction = async (data: any) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    try {
      const purchaseDate = new Date(data.date);
      purchaseDate.setHours(12, 0, 0, 0);

      // Trava de Segurança: Se for cartão de crédito, status DEVE ser pending
      const safeStatus = data.payment_method === 'credit_card' ? 'pending' : data.status;

      if (data.payment_method === 'credit_card' && data.card_id) {
        const card = cards.find(c => c.id === data.card_id);
        if (!card) throw new Error("Cartão não encontrado");

        const installmentsCount = data.installments || 1;
        const installmentsList = generateInstallments(
          Number(data.amount),
          installmentsCount,
          purchaseDate,
          card.closing_day,
          card.due_day
        );

        const transactionsToInsert = installmentsList.map(inst => ({
          description: installmentsCount > 1 
            ? `${data.description} (${inst.installmentNumber}/${installmentsCount})` 
            : data.description,
          amount: inst.amount,
          category: data.category,
          date: purchaseDate.toISOString(),
          invoice_date: inst.invoiceDate.toISOString(),
          status: 'pending', // Força pending aqui também
          payment_method: 'credit_card',
          type: 'expense',
          profile: currentProfile,
          user_id: user.id,
          card_id: card.id,
          installment_number: inst.installmentNumber,
          total_installments: installmentsCount
        }));

        const { data: newTransactions, error } = await supabase
          .from('transactions')
          .insert(transactionsToInsert)
          .select();

        if (error) throw error;
        if (newTransactions) {
          setTransactions(prev => [...newTransactions, ...prev]);
        }

      } else {
        const transactionToInsert = {
          description: data.description,
          amount: data.amount,
          category: data.category,
          date: purchaseDate.toISOString(),
          invoice_date: purchaseDate.toISOString(),
          status: safeStatus, // Usa o status seguro
          payment_method: data.payment_method,
          type: data.type,
          profile: currentProfile,
          user_id: user.id
        };

        const { data: newTransaction, error } = await supabase
          .from('transactions')
          .insert(transactionToInsert)
          .select()
          .single();

        if (error) throw error;
        if (newTransaction) {
          setTransactions(prev => [newTransaction, ...prev]);
        }
      }

    } catch (error) {
      console.error('Erro ao adicionar:', error);
      throw error;
    }
  };

  const editTransaction = async (id: string, data: any) => {
    const safeDate = new Date(data.date);
    safeDate.setHours(12, 0, 0, 0);
    
    const { card_id, installments, ...cleanData } = data;
    
    // Trava de Segurança na Edição também
    if (cleanData.payment_method === 'credit_card') {
      cleanData.status = 'pending';
    }

    const { data: updated, error } = await supabase
      .from('transactions')
      .update({ ...cleanData, date: safeDate.toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    if (updated) setTransactions(prev => prev.map(t => t.id === id ? updated : t));
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = async (data: Omit<Category, 'id'>) => {
    if (!user) return;
    const { data: newCat, error } = await supabase.from('categories').insert({ ...data, user_id: user.id }).select().single();
    if (error) throw error;
    if (newCat) setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const filteredTransactions = transactions.filter(t => t.profile === currentProfile);
  const filteredCategories = categories.filter(c => 
    ((c as any).profile === currentProfile) && 
    (c.user_id === user?.id || c.user_id === null)
  );

  const getSummary = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return filteredTransactions.reduce((acc, t) => {
      const amount = Number(t.amount);
      const tDate = new Date(t.date);
      const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      
      // LÓGICA DE SALDO (CAIXA): Só considera o que está COMPLETED (Pago/Recebido)
      // Transações pendentes (como cartão de crédito não pago) NÃO afetam o saldo.
      
      if (t.status === 'completed') {
        if (t.type === 'income') {
          acc.income += amount;
          acc.balance += amount;
          if (isCurrentMonth) acc.monthlyBalance += amount;
        } else {
          acc.expense += amount;
          acc.balance -= amount;
          if (isCurrentMonth) acc.monthlyBalance -= amount;
        }
      } else {
        // Apenas para controle de pendências, não afeta o saldo atual
        if (t.type === 'income') {
          acc.pendingIncome += amount;
        } else {
          acc.pendingExpense += amount;
        }
      }
      return acc;
    }, { income: 0, expense: 0, balance: 0, monthlyBalance: 0, pendingIncome: 0, pendingExpense: 0 });
  };

  return (
    <FinanceContext.Provider value={{
      transactions: filteredTransactions,
      currentProfile,
      categories: filteredCategories,
      cards,
      isLoading,
      switchProfile,
      addTransaction,
      editTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      addCard,
      deleteCard,
      payInvoice,
      getSummary
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
