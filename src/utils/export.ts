import { Transaction, Category, PAYMENT_METHODS } from '../types';
import { formatDate, formatCurrency } from './format';

export const exportToCSV = (transactions: Transaction[], categories: Category[]) => {
  const headers = [
    'Data',
    'Descrição',
    'Tipo',
    'Categoria',
    'Valor',
    'Status',
    'Método de Pagamento'
  ];

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const getPaymentMethodLabel = (method: string) => PAYMENT_METHODS.find(p => p.value === method)?.label || method;

  const rows = transactions.map(t => [
    formatDate(t.date),
    `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
    t.type === 'income' ? 'Receita' : 'Despesa',
    getCategoryName(t.category),
    t.amount.toFixed(2).replace('.', ','),
    t.status === 'completed' ? 'Concluído' : 'Pendente',
    getPaymentMethodLabel(t.payment_method)
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
