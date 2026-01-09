import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Loader2, CheckCircle2, Clock, CreditCard, Pencil } from 'lucide-react';
import { clsx } from 'clsx';
import { PAYMENT_METHODS, Transaction } from '../../types';
import { IconRenderer } from '../../utils/icons';

export interface TransactionFilters {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  status: 'all' | 'completed' | 'pending';
  month: string; // 'all' or 'MM'
  year: string; // 'YYYY'
}

interface TransactionTableProps {
  limit?: number;
  hideFilters?: boolean;
  externalFilters?: TransactionFilters;
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  limit, 
  hideFilters = false,
  externalFilters,
  onEdit
}) => {
  const { transactions, categories, deleteTransaction, isLoading } = useFinance();
  
  // Internal state for when used in "simple" mode (Dashboard)
  const [internalSearch, setInternalSearch] = React.useState('');
  
  const filters = externalFilters || {
    search: internalSearch,
    type: 'all',
    category: 'all',
    status: 'all',
    month: 'all',
    year: 'all'
  };

  const filteredData = useMemo(() => {
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        
        // Search
        const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase());
        
        // Type
        const matchesType = filters.type === 'all' || t.type === filters.type;
        
        // Category
        const matchesCategory = filters.category === 'all' || filters.category === '' || t.category === filters.category;
        
        // Status
        const matchesStatus = filters.status === 'all' || t.status === filters.status;
        
        // Date Filters
        const matchesMonth = filters.month === 'all' || (tDate.getMonth() + 1).toString() === filters.month;
        const matchesYear = filters.year === 'all' || tDate.getFullYear().toString() === filters.year;

        return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesMonth && matchesYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);

  const displayData = limit ? filteredData.slice(0, limit) : filteredData;

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || id;
  const getCategoryColor = (id: string) => categories.find((c) => c.id === id)?.color || '#cbd5e1';
  const getCategoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon;
  const getPaymentMethodLabel = (method: string) => PAYMENT_METHODS.find(p => p.value === method)?.label || method;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-100 bg-white">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm">Carregando transações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Descrição</th>
              <th className="px-6 py-4 font-medium">Categoria</th>
              <th className="px-6 py-4 font-medium">Data</th>
              <th className="px-6 py-4 font-medium">Pagamento</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Valor</th>
              <th className="px-6 py-4 font-medium text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayData.length > 0 ? (
              displayData.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {transaction.type === 'income' ? (
                        <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                          <ArrowUpCircle size={18} />
                        </div>
                      ) : (
                        <div className="rounded-full bg-red-100 p-1.5 text-red-600">
                          <ArrowDownCircle size={18} />
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{transaction.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ 
                        backgroundColor: `${getCategoryColor(transaction.category)}20`,
                        color: getCategoryColor(transaction.category)
                      }}
                    >
                      <IconRenderer iconName={getCategoryIcon(transaction.category)} size={12} />
                      {getCategoryName(transaction.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(transaction.date)}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-1.5 text-xs">
                      <CreditCard size={14} className="text-slate-400" />
                      <span>{getPaymentMethodLabel(transaction.payment_method)}</span>
                      {transaction.payment_method === 'credit_card' && transaction.total_installments && transaction.total_installments > 1 && (
                        <span className="ml-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 border border-indigo-100">
                          {transaction.installment_number}/{transaction.total_installments}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {transaction.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 size={12} /> Pago
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                        <Clock size={12} /> Pendente
                      </span>
                    )}
                  </td>
                  <td className={clsx(
                    "px-6 py-4 text-right font-medium",
                    transaction.type === 'income' ? "text-emerald-600" : "text-red-600"
                  )}>
                    {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(transaction)}
                          className="rounded p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteTransaction(transaction.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <p>{filters.search ? 'Nenhuma transação encontrada para a busca.' : 'Nenhuma transação registrada neste período.'}</p>
                    {externalFilters && externalFilters.month !== 'all' && (
                      <p className="text-xs text-slate-400">
                        Dica: Tente mudar o filtro de mês ou clicar em "Limpar Filtros".
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {limit && filteredData.length > limit && (
        <div className="border-t border-slate-100 p-4 text-center">
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Ver todas as transações
          </button>
        </div>
      )}
    </div>
  );
};
