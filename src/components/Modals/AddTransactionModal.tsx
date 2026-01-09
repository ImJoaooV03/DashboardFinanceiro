import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, ArrowUpCircle, ArrowDownCircle, Loader2, CreditCard as CardIcon } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { TransactionType, TransactionStatus, PaymentMethod, PAYMENT_METHODS, Transaction } from '../../types';
import { clsx } from 'clsx';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  transactionToEdit?: Transaction | null;
}

interface FormData {
  description: string;
  amount: number | string;
  category: string;
  date: string;
  status: TransactionStatus;
  payment_method: PaymentMethod;
  card_id?: string;
  installments?: number;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  initialType = 'expense',
  transactionToEdit 
}) => {
  const { addTransaction, editTransaction, categories, cards } = useFinance();
  const { addToast } = useToast();
  
  const [currentType, setCurrentType] = useState<TransactionType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      status: 'completed',
      payment_method: 'pix',
      date: new Date().toISOString().split('T')[0],
      installments: 1
    }
  });

  const selectedPaymentMethod = watch('payment_method');

  // Efeito para forçar status Pendente se for Cartão de Crédito
  useEffect(() => {
    if (selectedPaymentMethod === 'credit_card') {
      setValue('status', 'pending');
    }
  }, [selectedPaymentMethod, setValue]);

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setCurrentType(transactionToEdit.type);
        setValue('description', transactionToEdit.description);
        setValue('amount', transactionToEdit.amount);
        setValue('category', transactionToEdit.category);
        setValue('date', transactionToEdit.date.split('T')[0]);
        setValue('status', transactionToEdit.status);
        setValue('payment_method', transactionToEdit.payment_method);
        if (transactionToEdit.card_id) setValue('card_id', transactionToEdit.card_id);
      } else {
        setCurrentType(initialType);
        reset({
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
          payment_method: 'pix',
          installments: 1
        });
      }
    }
  }, [isOpen, transactionToEdit, initialType, reset, setValue]);

  const filteredCategories = categories.filter((c) => c.type === currentType);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const amountValue = Number(data.amount);
      if (isNaN(amountValue) || amountValue <= 0) throw new Error("Valor inválido.");

      if (data.payment_method === 'credit_card' && !data.card_id) {
        throw new Error("Selecione um cartão de crédito.");
      }

      // Garante que cartão de crédito seja sempre pendente (regra de negócio)
      const finalStatus = data.payment_method === 'credit_card' ? 'pending' : data.status;

      const transactionData = {
        description: data.description,
        amount: amountValue,
        category: data.category,
        date: data.date, 
        status: finalStatus,
        payment_method: data.payment_method,
        type: currentType,
        card_id: data.card_id,
        installments: data.installments
      };

      if (transactionToEdit) {
        await editTransaction(transactionToEdit.id, transactionData);
        addToast('Atualizado com sucesso!', 'success');
      } else {
        await addTransaction(transactionData);
        addToast('Salvo com sucesso!', 'success');
      }
      onClose();
    } catch (error: any) {
      addToast(error.message || "Erro ao salvar.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">{transactionToEdit ? 'Editar' : 'Nova Transação'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Toggle Tipo */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => setCurrentType('income')} className={clsx("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", currentType === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>
              <ArrowUpCircle size={16} /> Receita
            </button>
            <button type="button" onClick={() => setCurrentType('expense')} className={clsx("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", currentType === 'expense' ? "bg-white text-red-600 shadow-sm" : "text-slate-500")}>
              <ArrowDownCircle size={16} /> Despesa
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
            <input {...register('description', { required: true })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Ex: Mercado" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor</label>
              <input {...register('amount', { required: true })} type="number" step="0.01" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500" placeholder="0,00" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data da Compra</label>
              <input {...register('date', { required: true })} type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
            <select {...register('category', { required: true })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 bg-white">
              <option value="">Selecione...</option>
              {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pagamento</label>
            <select {...register('payment_method')} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 bg-white">
              {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {/* Campos Específicos de Cartão de Crédito */}
          {selectedPaymentMethod === 'credit_card' && currentType === 'expense' && (
            <div className="rounded-xl bg-indigo-50 p-4 space-y-4 border border-indigo-100 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm mb-2">
                <CardIcon size={16} /> Configuração do Cartão
              </div>
              
              <div>
                <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Selecione o Cartão</label>
                <select 
                  {...register('card_id', { required: true })} 
                  className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">Selecione um cartão...</option>
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>{card.name} (Fecha dia {card.closing_day})</option>
                  ))}
                </select>
                {cards.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Nenhum cartão cadastrado. Vá em "Cartões" para adicionar.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Parcelas</label>
                <select 
                  {...register('installments')} 
                  className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="1">À vista (1x)</option>
                  {/* Gera opções de 2x até 18x */}
                  {Array.from({ length: 17 }, (_, i) => i + 2).map(num => (
                    <option key={num} value={num}>{num}x</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
            <div className="flex gap-2">
              <label className={clsx("flex-1 cursor-pointer rounded-lg border px-2 py-2 text-center text-xs font-medium transition-colors hover:bg-white", watch('status') === 'completed' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600", selectedPaymentMethod === 'credit_card' && "opacity-50 cursor-not-allowed")}>
                <input type="radio" {...register('status')} value="completed" className="hidden" disabled={selectedPaymentMethod === 'credit_card'} />
                Concluído
              </label>
              <label className={clsx("flex-1 cursor-pointer rounded-lg border px-2 py-2 text-center text-xs font-medium transition-colors hover:bg-white", watch('status') === 'pending' ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 bg-slate-50 text-slate-600")}>
                <input type="radio" {...register('status')} value="pending" className="hidden" />
                Pendente
              </label>
            </div>
            {selectedPaymentMethod === 'credit_card' && (
              <p className="text-xs text-slate-400 mt-1 ml-1 flex items-center gap-1">
                <ArrowDownCircle size={12} />
                Compras no crédito são registradas como <strong>Pendentes</strong> até o pagamento da fatura.
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className={clsx("w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]", currentType === 'income' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-red-600 hover:bg-red-700 shadow-red-500/20")}>
            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (transactionToEdit ? 'Atualizar' : 'Salvar')}
          </button>
        </form>
      </div>
    </div>
  );
};
