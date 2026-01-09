import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export const Charts: React.FC = () => {
  const { transactions, categories } = useFinance();

  // Prepare data for Expenses by Category
  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => {
      const category = categories.find((c) => c.id === curr.category);
      if (category) {
        const existing = acc.find((item) => item.name === category.name);
        if (existing) {
          existing.value += Number(curr.amount);
        } else {
          acc.push({ name: category.name, value: Number(curr.amount), color: category.color });
        }
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

  // Prepare data for Cash Flow (Last 6 months mock logic or based on real data)
  // For simplicity, grouping by date in current data
  const cashFlowData = transactions
    .reduce((acc, curr) => {
      const date = new Date(curr.date);
      const key = `${date.getDate()}/${date.getMonth() + 1}`; // Day/Month for demo
      
      const existing = acc.find(item => item.date === key);
      if (existing) {
        if (curr.type === 'income') existing.receitas += Number(curr.amount);
        else existing.despesas += Number(curr.amount);
      } else {
        acc.push({
          date: key,
          receitas: curr.type === 'income' ? Number(curr.amount) : 0,
          despesas: curr.type === 'expense' ? Number(curr.amount) : 0,
        });
      }
      return acc;
    }, [] as { date: string; receitas: number; despesas: number }[])
    .slice(-7); // Last 7 data points

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Expenses Chart */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Despesas por Categoria</h3>
        <div className="h-[300px] w-full">
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => 
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Sem dados de despesas
            </div>
          )}
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Fluxo de Caixa</h3>
        <div className="h-[300px] w-full">
          {cashFlowData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(value: number) => 
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                  }
                />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Sem dados de fluxo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
