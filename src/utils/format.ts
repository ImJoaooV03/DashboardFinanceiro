import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
};

export const formatMonth = (dateString: string): string => {
  return format(new Date(dateString), 'MMMM yyyy', { locale: ptBR });
};
