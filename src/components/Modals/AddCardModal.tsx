import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { clsx } from 'clsx';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CardFormData {
  name: string;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  color: string;
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#1f2937'];

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose }) => {
  const { addCard } = useFinance();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm<CardFormData>({
    defaultValues: {
      color: COLORS[0],
      closing_day: 25,
      due_day: 5
    }
  });

  const selectedColor = watch('color');

  const onSubmit = async (data: CardFormData) => {
    setIsSubmitting(true);
    try {
      await addCard({
        name: data.name,
        limit_amount: Number(data.limit_amount),
        closing_day: Number(data.closing_day),
        due_day: Number(data.due_day),
        color: data.color
      });
      addToast('Cartão adicionado com sucesso!', 'success');
      reset();
      onClose();
    } catch (error) {
      addToast('Erro ao adicionar cartão.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-800">Novo Cartão de Crédito</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Preview do Cartão */}
          <div 
            className="relative h-40 w-full rounded-xl p-6 text-white shadow-lg transition-colors"
            style={{ backgroundColor: selectedColor }}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex justify-between">
                <CreditCard size={24} />
                <span className="font-mono text-lg font-bold tracking-widest">**** ****</span>
              </div>
              <div>
                <p className="text-xs opacity-80">Nome do Cartão</p>
                <p className="font-bold">{watch('name') || 'Meu Cartão'}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Nome do Cartão</label>
            <input {...register('name', { required: true })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500" placeholder="Ex: Nubank, Visa Infinite" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Limite (R$)</label>
            <input {...register('limit_amount', { required: true })} type="number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500" placeholder="5000,00" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Dia Fechamento</label>
              <input {...register('closing_day', { required: true, min: 1, max: 31 })} type="number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Dia Vencimento</label>
              <input {...register('due_day', { required: true, min: 1, max: 31 })} type="number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Cor do Cartão</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={clsx(
                    "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                    selectedColor === color ? "border-slate-800 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:scale-[1.02]">
            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Adicionar Cartão'}
          </button>
        </form>
      </div>
    </div>
  );
};
