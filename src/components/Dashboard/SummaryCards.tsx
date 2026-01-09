import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/format';
import { Wallet, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { clsx } from 'clsx';

export const SummaryCards: React.FC = () => {
  const { getSummary } = useFinance();
  const summary = getSummary();

  const cards = [
    {
      label: 'Saldo Total',
      value: summary.balance,
      icon: Wallet,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      trend: '+2.5%', // Mock trend
    },
    {
      label: 'Receitas',
      value: summary.income,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+12%',
    },
    {
      label: 'Despesas',
      value: summary.expense,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      trend: '-4%',
    },
    {
      label: 'Balanço Mensal',
      value: summary.monthlyBalance,
      icon: Scale,
      color: summary.monthlyBalance >= 0 ? 'text-blue-600' : 'text-orange-600',
      bg: summary.monthlyBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50',
      trend: 'Mês Atual',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-800">
                {formatCurrency(card.value)}
              </h3>
            </div>
            <div className={clsx("rounded-lg p-3", card.bg, card.color)}>
              <card.icon size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full", 
              card.trend.includes('+') ? "bg-emerald-100 text-emerald-700" : 
              card.trend.includes('-') ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
            )}>
              {card.trend}
            </span>
            <span className="text-xs text-slate-400">vs. último período</span>
          </div>
        </div>
      ))}
    </div>
  );
};
