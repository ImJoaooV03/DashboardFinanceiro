import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TransactionTable, TransactionFilters } from '../components/Transactions/TransactionTable';
import { AddTransactionModal } from '../components/Modals/AddTransactionModal';
import { Plus, Download, Filter, Search, X } from 'lucide-react';
import { exportToCSV } from '../utils/export';
import { Transaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const { categories, transactions } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialType, setInitialType] = useState<'income' | 'expense'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: 'all',
    category: 'all',
    status: 'all',
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString()
  });

  const openNewTransaction = () => {
    setEditingTransaction(null);
    setInitialType('expense');
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setInitialType(transaction.type);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    exportToCSV(transactions, categories);
  };

  const updateFilter = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      status: 'all',
      month: 'all', // Mostra tudo para evitar confusão de datas
      year: 'all'
    });
  };

  const hasActiveFilters = filters.month !== 'all' || filters.year !== 'all' || filters.category !== 'all' || filters.status !== 'all' || filters.type !== 'all' || filters.search !== '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Transações</h2>
          <p className="text-slate-500">Gerencie todas as suas entradas e saídas.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <button 
            onClick={openNewTransaction}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all hover:shadow-md"
          >
            <Plus size={18} />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter size={18} className="text-indigo-500" />
            Filtros Avançados
          </div>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              <X size={14} />
              Limpar Filtros
            </button>
          )}
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Busca */}
          <div className="lg:col-span-1">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Descrição..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Data */}
          <div className="flex gap-2 lg:col-span-1">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Mês</label>
              <select 
                value={filters.month}
                onChange={(e) => updateFilter('month', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
              >
                <option value="all">Todos</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m.toString()}>{new Date(0, m-1).toLocaleString('pt-BR', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Ano</label>
              <select 
                value={filters.year}
                onChange={(e) => updateFilter('year', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
              >
                <option value="all">Todos</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Categoria</label>
            <select 
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">Todas</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Tipo</label>
            <select 
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">Todos</option>
              <option value="completed">Concluído</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela com Filtros Aplicados */}
      <TransactionTable 
        externalFilters={filters} 
        onEdit={handleEdit}
      />

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={initialType}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};
