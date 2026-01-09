import React, { useState } from 'react';
import { SummaryCards } from '../components/Dashboard/SummaryCards';
import { Charts } from '../components/Dashboard/Charts';
import { CardsWidget } from '../components/Dashboard/CardsWidget';
import { TransactionTable } from '../components/Transactions/TransactionTable';
import { AddTransactionModal } from '../components/Modals/AddTransactionModal';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { Transaction } from '../types';

export const DashboardPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialType, setInitialType] = useState<'income' | 'expense'>('income');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const openModal = (type: 'income' | 'expense') => {
    setEditingTransaction(null);
    setInitialType(type);
    setModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setInitialType(transaction.type);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Action Buttons Mobile/Desktop */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Financeiro</h2>
        <div className="flex gap-3">
          <button
            onClick={() => openModal('income')}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">Nova Receita</span>
          </button>
          <button
            onClick={() => openModal('expense')}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            <MinusCircle size={18} />
            <span className="hidden sm:inline">Nova Despesa</span>
          </button>
        </div>
      </div>

      <SummaryCards />
      
      {/* Widget de Cartões */}
      <CardsWidget />
      
      {/* Grid Layout: Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Charts />
      </div>
      
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Últimas Transações</h3>
        <TransactionTable 
          limit={5} 
          hideFilters 
          onEdit={handleEdit}
        />
      </div>

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={initialType}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};
