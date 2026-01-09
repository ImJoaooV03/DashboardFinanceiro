import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // 1. Captura o elemento com alta resolução (scale: 2)
    const canvas = await html2canvas(element, {
      scale: 2, // Melhora a qualidade do texto e gráficos
      useCORS: true, // Permite carregar imagens externas se houver
      logging: false,
      backgroundColor: '#ffffff', // Garante fundo branco
      windowWidth: element.scrollWidth,
    });

    // 2. Configurações do PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 3. Cálculos de dimensão para ajustar na página A4
    const imgWidth = 210; // Largura A4 em mm
    const pageHeight = 297; // Altura A4 em mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // 4. Adiciona a imagem ao PDF
    // Se a imagem for maior que uma página, cria múltiplas páginas (básico)
    // Para este dashboard, vamos tentar ajustar na primeira página com margem superior
    
    const marginTop = 20; // Espaço para cabeçalho
    
    // Cabeçalho Profissional Desenhado no PDF (Vetorial, sempre nítido)
    pdf.setFillColor(79, 70, 229); // Indigo-600 (cor da marca)
    pdf.rect(0, 0, 210, 15, 'F'); // Barra superior colorida
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório Financeiro Detalhado', 10, 10);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 105, 10, { align: 'center' });

    // Adiciona a imagem do dashboard logo abaixo do cabeçalho
    pdf.addImage(imgData, 'PNG', 0, marginTop, imgWidth, imgHeight);

    // Rodapé simples
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Dualite Finance Dashboard', 10, pageHeight - 10);

    // 5. Salva o arquivo
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Houve um erro ao gerar o PDF. Tente novamente.');
  }
};
