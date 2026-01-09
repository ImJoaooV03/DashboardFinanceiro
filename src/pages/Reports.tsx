import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { generatePDF } from '../utils/pdfGenerator';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Wallet, Target, AlertCircle, FileDown, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { IconRenderer } from '../utils/icons';

export const ReportsPage: React.FC = () => {
  const { transactions, categories } = useFinance();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Filtros
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  // Cores para gráficos
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'];

  // --- PROCESSAMENTO DE DADOS ---

  // Dados filtrados pelo ano selecionado (para o gráfico anual)
  const yearTransactions = useMemo(() => {
    return transactions.filter(t => 
      new Date(t.date).getFullYear().toString() === selectedYear &&
      t.status === 'completed' // Apenas transações efetivadas
    );
  }, [transactions, selectedYear]);

  // Dados filtrados pelo mês selecionado (para detalhes)
  const monthTransactions = useMemo(() => {
    return yearTransactions.filter(t => 
      (new Date(t.date).getMonth() + 1).toString() === selectedMonth
    );
  }, [yearTransactions, selectedMonth]);

  // 1. Dados para o Gráfico de Evolução Anual
  const annualData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString('pt-BR', { month: 'short' }),
      receitas: 0,
      despesas: 0,
      saldo: 0
    }));

    yearTransactions.forEach(t => {
      const monthIndex = new Date(t.date).getMonth();
      const amount = Number(t.amount);
      if (t.type === 'income') {
        data[monthIndex].receitas += amount;
        data[monthIndex].saldo += amount;
      } else {
        data[monthIndex].despesas += amount;
        data[monthIndex].saldo -= amount;
      }
    });

    return data;
  }, [yearTransactions]);

  // 2. Dados para Gráficos de Categoria (Mês Selecionado)
  const getCategoryData = (type: 'income' | 'expense') => {
    // Agrupa por ID da categoria para preservar metadados (cor, ícone)
    const grouped = monthTransactions
      .filter(t => t.type === type)
      .reduce((acc, curr) => {
        const catId = curr.category;
        acc[catId] = (acc[catId] || 0) + Number(curr.amount);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([id, value]) => {
        const cat = categories.find(c => c.id === id);
        return {
          name: cat?.name || 'Outros',
          value,
          color: cat?.color || '#cbd5e1',
          icon: cat?.icon
        };
      })
      .sort((a, b) => b.value - a.value);
  };

  const expenseCategoryData = useMemo(() => getCategoryData('expense'), [monthTransactions, categories]);
  const incomeCategoryData = useMemo(() => getCategoryData('income'), [monthTransactions, categories]);

  // 3. KPIs do Mês
  const monthKPIs = useMemo(() => {
    const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    
    // Média diária de gastos
    const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
    const today = new Date().getDate();
    const isCurrentMonth = new Date().getMonth() + 1 === Number(selectedMonth) && new Date().getFullYear() === Number(selectedYear);
    const daysToCalc = isCurrentMonth ? today : daysInMonth;
    const dailyAverage = expense / (daysToCalc || 1);

    return { income, expense, balance, savingsRate, dailyAverage };
  }, [monthTransactions, selectedYear, selectedMonth]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    setTimeout(async () => {
      await generatePDF('report-content', `Relatorio_Financeiro_${selectedMonth}_${selectedYear}`);
      setIsGeneratingPdf(false);
    }, 100);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header e Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios Financeiros</h2>
          <p className="text-slate-500">Análise detalhada do seu desempenho financeiro.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 transition-all"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileDown size={18} />
                Baixar Relatório PDF
              </>
            )}
          </button>

          <div className="flex gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-10 rounded-lg border-0 bg-transparent pl-9 pr-8 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:bg-slate-50"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m.toString()}>
                    {new Date(0, m-1).toLocaleString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-px bg-slate-200 my-1"></div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 rounded-lg border-0 bg-transparent px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:bg-slate-50"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Área de Conteúdo para o PDF */}
      <div id="report-content" className="space-y-8 bg-slate-50 p-4 -m-4 rounded-xl">
        
        {/* KPIs Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Resultado do Mês</p>
              <div className={clsx("p-2 rounded-lg", monthKPIs.balance >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                <Wallet size={20} />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">{formatCurrency(monthKPIs.balance)}</h3>
            <p className="mt-1 text-xs text-slate-400">Receitas - Despesas</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Taxa de Economia</p>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Target size={20} />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">{monthKPIs.savingsRate.toFixed(1)}%</h3>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
              <div 
                className="h-1.5 rounded-full bg-blue-500 transition-all" 
                style={{ width: `${Math.max(0, Math.min(100, monthKPIs.savingsRate))}%` }}
              ></div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Média Diária (Gastos)</p>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                <AlertCircle size={20} />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">{formatCurrency(monthKPIs.dailyAverage)}</h3>
            <p className="mt-1 text-xs text-slate-400">por dia neste mês</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Total Despesas</p>
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <TrendingDown size={20} />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">{formatCurrency(monthKPIs.expense)}</h3>
            <p className="mt-1 text-xs text-slate-400">{((monthKPIs.expense / (monthKPIs.income || 1)) * 100).toFixed(1)}% da receita</p>
          </div>
        </div>

        {/* Gráfico de Evolução Anual */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-slate-800">Evolução Financeira ({selectedYear})</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficos de Pizza lado a lado */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Despesas por Categoria */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-slate-800">Despesas por Categoria</h3>
            <p className="mb-6 text-sm text-slate-500">Onde você mais gastou em {new Date(0, Number(selectedMonth)-1).toLocaleString('pt-BR', { month: 'long' })}</p>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[250px] w-full md:w-1/2">
                {expenseCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                    Sem despesas neste período
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-1/2 space-y-3">
                {expenseCategoryData.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm" 
                        style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                      >
                        <IconRenderer iconName={item.icon} size={12} />
                      </div>
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Receitas por Categoria */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-slate-800">Origem das Receitas</h3>
            <p className="mb-6 text-sm text-slate-500">Suas fontes de renda em {new Date(0, Number(selectedMonth)-1).toLocaleString('pt-BR', { month: 'long' })}</p>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[250px] w-full md:w-1/2">
                {incomeCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {incomeCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[(index + 5) % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                    Sem receitas neste período
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-1/2 space-y-3">
                {incomeCategoryData.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm" 
                        style={{ backgroundColor: item.color || COLORS[(index + 5) % COLORS.length] }}
                      >
                        <IconRenderer iconName={item.icon} size={12} />
                      </div>
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
