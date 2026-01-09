import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';
import { CreditCard, Plus, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { AddCardModal } from '../components/Modals/AddCardModal';
import { clsx } from 'clsx';
import { addMonths, subMonths, format, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CardsPage: React.FC = () => {
  const { cards, transactions, payInvoice } = useFinance();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  
  // Estado para controle da data de visualização (Mês/Ano da fatura)
  const [viewDate, setViewDate] = useState(new Date());

  const activeCard = useMemo(() => 
    cards.find(c => c.id === selectedCardId) || cards[0], 
  [cards, selectedCardId]);

  // --- LÓGICA INTELIGENTE DE DATA INICIAL ---
  // Quando troca de cartão (ou carrega a página), verifica se a fatura do mês atual
  // já está paga. Se sim, avança para o próximo mês automaticamente.
  useEffect(() => {
    if (!activeCard) return;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Busca transações do mês atual do calendário
    const currentInvoiceTrans = transactions.filter(t => {
      if (t.card_id !== activeCard.id) return false;
      if (!t.invoice_date) return false;
      const tDate = new Date(t.invoice_date);
      return (tDate.getMonth() + 1) === currentMonth && tDate.getFullYear() === currentYear;
    });

    const total = currentInvoiceTrans.reduce((acc, t) => acc + Number(t.amount), 0);
    const pending = currentInvoiceTrans.filter(t => t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0);

    // Se o mês atual tem gastos E todos estão pagos (pending == 0), mostra o próximo mês
    // Se não tem gastos (total == 0), também assume que pode mostrar o próximo (fatura zerada)
    // Mas se tiver pendências, mostra o mês atual.
    if (total > 0 && pending === 0) {
      setViewDate(addMonths(now, 1));
    } else {
      setViewDate(now);
    }
  }, [activeCard?.id, transactions.length]); // Recalcula ao trocar de cartão ou adicionar transação

  // Navegação de Mês
  const handlePrevMonth = () => setViewDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setViewDate(prev => addMonths(prev, 1));

  // Filtra transações que pertencem à fatura selecionada
  const invoiceTransactions = useMemo(() => {
    if (!activeCard) return [];
    
    const targetMonth = viewDate.getMonth() + 1;
    const targetYear = viewDate.getFullYear();

    return transactions.filter(t => {
      if (t.card_id !== activeCard.id) return false;
      if (!t.invoice_date) return false; // Segurança

      const tDate = new Date(t.invoice_date);
      const tMonth = tDate.getMonth() + 1;
      const tYear = tDate.getFullYear();

      return tMonth === targetMonth && tYear === targetYear;
    });
  }, [transactions, activeCard, viewDate]);

  // Calcula totais
  const invoiceTotal = invoiceTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
  const pendingTotal = invoiceTransactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0);
  
  // Formatação do Mês para exibição
  const currentMonthName = format(viewDate, 'MMMM', { locale: ptBR });
  const currentYear = format(viewDate, 'yyyy');

  const handlePayInvoice = async () => {
    if (!activeCard) return;
    
    if (!window.confirm(`Deseja confirmar o pagamento da fatura de ${currentMonthName} no valor de ${formatCurrency(pendingTotal)}?`)) {
      return;
    }

    setIsPaying(true);
    try {
      await payInvoice(activeCard.id, viewDate);
      addToast('Fatura paga com sucesso!', 'success');
      // A lógica do useEffect vai rodar e jogar para o próximo mês automaticamente
    } catch (error) {
      addToast('Erro ao pagar fatura.', 'error');
      console.error(error);
    } finally {
      setIsPaying(false);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 rounded-full bg-indigo-50 p-6 text-indigo-600">
          <CreditCard size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Nenhum cartão cadastrado</h2>
        <p className="mt-2 max-w-md text-slate-500">Adicione seus cartões de crédito para gerenciar limites, faturas e parcelamentos de forma inteligente.</p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-8 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:-translate-y-1"
        >
          <Plus size={20} />
          Adicionar Cartão
        </button>
        <AddCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Meus Cartões</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Novo Cartão
        </button>
      </div>

      {/* Lista de Cartões (Tabs) */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {cards.map(card => (
          <div 
            key={card.id}
            onClick={() => setSelectedCardId(card.id)}
            className={clsx(
              "min-w-[280px] cursor-pointer rounded-2xl p-6 text-white shadow-lg transition-all hover:-translate-y-1",
              activeCard?.id === card.id ? "ring-4 ring-indigo-500/20 scale-[1.02]" : "opacity-80 hover:opacity-100"
            )}
            style={{ backgroundColor: card.color }}
          >
            <div className="flex justify-between items-start mb-8">
              <CreditCard size={28} />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Vence dia {card.due_day}</span>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Limite do Cartão</p>
              <p className="text-2xl font-bold">{formatCurrency(card.limit_amount)}</p>
            </div>
            <div className="mt-4 flex justify-between items-end">
              <p className="font-medium">{card.name}</p>
              <p className="text-xs opacity-60">Fecha dia {card.closing_day}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detalhes da Fatura */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        
        {/* Cabeçalho da Fatura com Navegação por Setas */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              Fatura de <span className="capitalize">{currentMonthName}</span>
            </h3>
            <p className="text-sm text-slate-500">
              Vencimento estimado: {activeCard?.due_day}/{format(viewDate, 'MM/yyyy')}
            </p>
          </div>

          {/* Controle de Navegação */}
          <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button 
              onClick={handlePrevMonth}
              className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
              title="Mês Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex flex-col items-center px-2 min-w-[120px]">
              <span className="text-sm font-bold text-slate-800 capitalize">{currentMonthName}</span>
              <span className="text-xs text-slate-500">{currentYear}</span>
            </div>

            <button 
              onClick={handleNextMonth}
              className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
              title="Próximo Mês"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-bold uppercase text-slate-400 mb-1">Total da Fatura</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(invoiceTotal)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-bold uppercase text-slate-400 mb-1">Status</p>
            <div className="flex items-center gap-2">
              {pendingTotal > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                  <AlertCircle size={14} /> Aberta
                </span>
              ) : invoiceTotal > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={14} /> Paga
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  <CheckCircle2 size={14} /> Zerada
                </span>
              )}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
             <button 
               className={clsx(
                 "w-full rounded-lg py-2 text-sm font-medium text-white transition-colors shadow-sm flex items-center justify-center gap-2",
                 pendingTotal === 0 
                   ? "bg-slate-300 cursor-not-allowed" 
                   : "bg-indigo-600 hover:bg-indigo-700"
               )}
               disabled={pendingTotal === 0 || isPaying}
               onClick={handlePayInvoice}
             >
               {isPaying ? (
                 <>
                   <Loader2 size={16} className="animate-spin" />
                   Processando...
                 </>
               ) : pendingTotal === 0 && invoiceTotal > 0 ? (
                 <>
                   <CheckCircle2 size={16} />
                   Fatura Paga
                 </>
               ) : (
                 'Pagar Fatura'
               )}
             </button>
          </div>
        </div>

        <h4 className="font-semibold text-slate-700 mb-4">Transações desta Fatura</h4>
        
        {/* Tabela Simplificada para Fatura */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Data Compra</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Parcela</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoiceTransactions.length > 0 ? (
                invoiceTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">{formatDate(t.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.description}</td>
                    <td className="px-4 py-3">
                      {t.installment_number ? (
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-100">
                          {t.installment_number}/{t.total_installments}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">À vista</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.status === 'completed' ? (
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Pago
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-orange-500 flex items-center gap-1">
                          <AlertCircle size={12} /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{formatCurrency(t.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <p>Nenhuma transação nesta fatura.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
