import { useIonToast, useIonLoading } from '@ionic/react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface PrintOptions {
  fileName: string;
  containerSelector: string;
}

/**
 * Hook para gerenciar a exportação de documentos para PDF.
 * Suporta download direto no navegador e integração com sistema de arquivos/compartilhamento no mobile (Capacitor).
 */
export const usePdfExport = () => {
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();

  const exportToPdf = async ({ fileName, containerSelector }: PrintOptions) => {
    const element = document.querySelector(containerSelector) as HTMLElement;
    
    if (!element) {
      presentToast({
        message: 'Erro: Conteúdo não encontrado.',
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
      return;
    }

    await presentLoading({
      message: 'Gerando PDF...',
      spinner: 'crescent'
    });

    try {
      // Cria um container temporário visível, mas fora da tela
      const tempContainer = document.createElement('div');
      tempContainer.className = 'pdf-export-temp-container';
      // Adicionamos uma classe específica para forçar o layout desktop no clone
      tempContainer.classList.add('force-desktop-layout');
      
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-10000px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm';
      tempContainer.style.background = '#ffffff';
      tempContainer.style.zIndex = '-9999';
      
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Garante que o clone e seus filhos mantenham os estilos necessários
      clone.style.display = 'block';
      clone.style.visibility = 'visible';
      clone.style.width = '210mm';
      clone.style.background = '#ffffff';
      
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Aguarda renderização
      await new Promise(resolve => setTimeout(resolve, 500));

      const opt = {
        margin: 0,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200, // Força o html2canvas a "pensar" que está em uma tela de 1200px (Desktop)
          onclone: (doc: Document) => {
            const el = doc.querySelector('.pdf-export-temp-container') as HTMLElement;
            if (el) {
              el.style.left = '0';
              el.style.position = 'relative';
              const container = el.querySelector('.pdf-container') as HTMLElement;
              if (container) {
                container.style.gap = '0';
                container.style.padding = '0';
                // Remove qualquer restrição de largura que venha do mobile
                container.style.width = '210mm';
                container.style.minWidth = '210mm';
              }
            }
          }
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const,
          compress: true
        },
        pagebreak: { mode: 'css' }
      };

      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        // No Mobile (Capacitor): Gera o PDF como base64 e usa o Filesystem + Share
        const pdfBase64 = await html2pdf().set(opt).from(clone).output('datauristring');
        const base64Content = pdfBase64.split(',')[1];
        const fullFileName = `${fileName}.pdf`;

        // Salva o arquivo temporariamente para poder compartilhar/abrir
        const savedFile = await Filesystem.writeFile({
          path: fullFileName,
          data: base64Content,
          directory: Directory.Cache // Usa cache para facilitar o compartilhamento
        });

        // Abre a planilha de compartilhamento nativa (isso faz aparecer a notificação/opções no topo)
        await Share.share({
          title: 'Vistoria Técnica',
          text: 'PDF da Vistoria Técnica',
          url: savedFile.uri,
          dialogTitle: 'Abrir ou Salvar PDF'
        });

      } else {
        // No Navegador (Desktop/Web): Download direto padrão
        await html2pdf().set(opt).from(clone).save();
      }

      document.body.removeChild(tempContainer);

      presentToast({
        message: isNative ? 'PDF pronto para salvar ou compartilhar!' : 'PDF baixado com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      presentToast({
        message: 'Não foi possível gerar o PDF.',
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
    } finally {
      dismissLoading();
    }
  };

  return { exportToPdf };
};
