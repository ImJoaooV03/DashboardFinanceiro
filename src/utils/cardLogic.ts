import { addMonths, setDate, isAfter, startOfDay } from 'date-fns';

/**
 * Calcula a data de vencimento da fatura para uma compra
 */
export const calculateInvoiceDate = (
  purchaseDate: Date,
  closingDay: number,
  dueDay: number
): Date => {
  // Normaliza a data da compra para evitar problemas de hora
  const purchase = startOfDay(purchaseDate);
  
  // Cria a data de fechamento para o mês da compra
  // Cuidado com dias inexistentes (ex: 31 em Fevereiro) -> setDate lida com isso avançando o mês, 
  // mas para lógica de cartão queremos comparar o dia numérico.
  
  const pDay = purchase.getDate();
  const pMonth = purchase.getMonth();
  const pYear = purchase.getFullYear();

  let invoiceMonth = pMonth;
  let invoiceYear = pYear;

  // Se comprou no dia do fechamento ou depois, vai para o próximo mês
  if (pDay >= closingDay) {
    invoiceMonth++;
  }

  // Agora ajustamos o ano se necessário
  if (invoiceMonth > 11) {
    invoiceMonth = 0;
    invoiceYear++;
  }

  // A data base da fatura é no mês calculado
  // Mas precisamos ver se o dia do vencimento é menor que o fechamento
  // Ex: Fecha 25, Vence 05.
  // Se a fatura é de "Fevereiro" (ciclo de Jan a Fev), o vencimento é em Março?
  // Geralmente:
  // Se DueDay < ClosingDay, o vencimento é no mês SEGUINTE ao mês de referência do fechamento.
  // Ex: Compra 10/01. Fecha 25/01. Entra na fatura de Jan. Vence 05/02.
  
  let dueMonth = invoiceMonth;
  let dueYear = invoiceYear;

  if (dueDay < closingDay) {
    dueMonth++;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear++;
    }
  }

  // Cria a data de vencimento final
  // Força meio-dia para evitar problemas de timezone UTC-3
  return new Date(dueYear, dueMonth, dueDay, 12, 0, 0);
};

/**
 * Gera as parcelas com suas respectivas datas de fatura
 */
export const generateInstallments = (
  totalAmount: number,
  installments: number,
  purchaseDate: Date,
  closingDay: number,
  dueDay: number
) => {
  const installmentValue = totalAmount / installments;
  const firstInvoiceDate = calculateInvoiceDate(purchaseDate, closingDay, dueDay);
  
  const results = [];

  for (let i = 0; i < installments; i++) {
    // Adiciona meses à data da primeira fatura
    const invoiceDate = addMonths(firstInvoiceDate, i);
    
    results.push({
      amount: Number(installmentValue.toFixed(2)), // Cuidado com arredondamento, ideal seria ajustar a última parcela
      installmentNumber: i + 1,
      invoiceDate: invoiceDate
    });
  }

  // Ajuste de centavos na primeira parcela
  const totalCalculated = results.reduce((acc, curr) => acc + curr.amount, 0);
  const diff = totalAmount - totalCalculated;
  if (Math.abs(diff) > 0.001) {
    results[0].amount += diff;
  }

  return results;
};
