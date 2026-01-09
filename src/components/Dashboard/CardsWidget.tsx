import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/format';
import { CreditCard, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export const CardsWidget: React.FC = () => {
  const { cards, transactions } = useFinance();

  const cardsWithInvoice = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return cards.map(card => {
      // 1. Calcular Limite Disponível (Limite - Tudo que está pendente globalmente)
      // O limite é consumido por todas as compras não pagas, inclusive parcelas futuras
      const allPending = transactions
        .filter(t => t.card_id === card.id && t.status === 'pending')
        .reduce((acc, t) => acc + Number(t.amount), 0);
      
      const availableLimit = Math.max(0, card.limit_amount - allPending);

      // 2. Determinar qual fatura exibir (Atual ou Próxima)
      let targetMonth = currentMonth;
      let targetYear = currentYear;

      const getInvoiceStats = (m: number, y: number) => {
        const relevant = transactions.filter(t => {
          if (t.card_id !== card.id) return false;
          if (!t.invoice_date) return false;
          const tDate = new Date(t.invoice_date);
          return tDate.getMonth() === m && tDate.getFullYear() === y;
        });
        
        const total = relevant.reduce((acc, t) => acc + Number(t.amount), 0);
        const pending = relevant.filter(t => t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0);
        
        return { total, pending };
      };

      let stats = getInvoiceStats(targetMonth, targetYear);

      // LÓGICA DE AVANÇO:
      // Se a fatura do mês atual tem lançamentos (total > 0) MAS já está toda paga (pending == 0),
      // então o usuário já quitou este mês. Devemos mostrar o próximo.
      if (stats.total > 0 && stats.pending === 0) {
        if (targetMonth === 11) {
          targetMonth = 0;
          targetYear++;
        } else {
          targetMonth++;
        }
        // Recalcula para o próximo mês
        stats = getInvoiceStats(targetMonth, targetYear);
      }

      // Nome do mês para exibição (ex: "Fevereiro")
      const monthName = new Date(targetYear, targetMonth).toLocaleString('pt-BR', { month: 'long' });

      return {
        ...card,
        displayTotal: stats.total,   // Mostra o total da fatura (cheia)
        displayPending: stats.pending, // Quanto falta pagar (se for o mês seguinte, geralmente é igual ao total)
        displayMonth: monthName,
        availableLimit
      };
    });
  }, [cards, transactions]);

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={20} className="text-indigo-600" />
            Meus Cartões
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-slate-500 mb-4">Cadastre seus cartões para controlar faturas.</p>
          <Link 
            to="/cards"
            className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            <Plus size={16} />
            Adicionar Cartão
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <CreditCard size={20} className="text-indigo-600" />
          Meus Cartões
        </h3>
        <Link to="/cards" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
          Ver detalhes
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cardsWithInvoice.map(card => (
          <div 
            key={card.id}
            className="relative overflow-hidden rounded-xl p-5 text-white shadow-md transition-transform hover:-translate-y-1"
            style={{ backgroundColor: card.color }}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="font-medium truncate pr-2">{card.name}</span>
              <CreditCard size={20} className="opacity-80" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-xs opacity-80">Fatura ({card.displayMonth})</p>
                {/* Indicador se é fatura futura ou atual */}
                {card.displayPending === 0 && card.displayTotal > 0 ? (
                  <span className="text-[10px] bg-white/20 px-1.5 rounded">Paga</span>
                ) : null}
              </div>
              <p className="text-xl font-bold">{formatCurrency(card.displayTotal)}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
              <div className="text-xs">
                <span className="opacity-70">Limite: </span>
                <span className="font-medium">{formatCurrency(card.availableLimit)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {card.displayPending > 0 ? (
                  <>
                    <AlertCircle size={10} />
                    <span>Aberta</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={10} />
                    <span>Zerada</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <Link 
          to="/cards"
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
        >
          <Plus size={24} />
          <span className="mt-2 text-sm font-medium">Novo Cartão</span>
        </Link>
      </div>
    </div>
  );
};
