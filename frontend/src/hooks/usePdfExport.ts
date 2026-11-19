import { useIonToast, useIonLoading } from '@ionic/react';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';
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

    let tempContainer: HTMLDivElement | null = null;

    try {
      // Cria um container temporário visível, mas fora da tela
      tempContainer = document.createElement('div');
      tempContainer.className = 'pdf-export-temp-container force-desktop-layout';
      
      Object.assign(tempContainer.style, {
        position: 'fixed',
        left: '-10000px',
        top: '0',
        width: '210mm',
        background: '#ffffff',
        zIndex: '-9999',
      });
      
      const clone = element.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        display: 'block',
        visibility: 'visible',
        width: '210mm',
        background: '#ffffff',
      });
      
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // 1. Converter todas as imagens para Base64 e aguardar o carregamento real no DOM
      const images = Array.from(clone.querySelectorAll('img'));
      await Promise.all(images.map(async (img) => {
        if (!img.src || img.src.startsWith('data:')) return;
        
        try {
          const response = await fetch(img.src, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          });
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          // Aguarda o evento de 'load' da imagem após trocar o SRC para Base64
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = base64;
            // Se a imagem já estiver completa (cache), resolve imediatamente
            if (img.complete) resolve(null);
          });
          
          img.removeAttribute('crossorigin');
          // Força estilos que garantam visibilidade para o canvas
          img.style.display = 'block';
          img.style.opacity = '1';
          img.style.visibility = 'visible';
        } catch (e) {
          console.warn('Erro ao processar imagem para PDF:', img.src, e);
        }
      }));

      // Aguarda um tempo extra de segurança para renderização do layout
      await new Promise(resolve => setTimeout(resolve, 1500));

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      });

      const pages = Array.from(clone.querySelectorAll('.pdf-page')) as HTMLElement[];
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Renderiza cada página A4 individualmente para o PDF
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794, // Largura aproximada de 210mm em 96dpi * scale
          height: 1123, // Altura aproximada de 297mm em 96dpi * scale
          windowWidth: 800,
          onclone: (clonedDoc) => {
            // Garante que o elemento clonado pelo html2canvas esteja visível
            const clonedPage = clonedDoc.querySelector('.pdf-export-temp-container .pdf-page') as HTMLElement;
            if (clonedPage) {
              clonedPage.style.display = 'block';
              clonedPage.style.visibility = 'visible';
            }
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'SLOW');
      }

      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        const pdfBase64 = pdf.output('datauristring');
        const base64Content = pdfBase64.split(',')[1];
        const fullFileName = `${fileName}.pdf`;

        const savedFile = await Filesystem.writeFile({
          path: fullFileName,
          data: base64Content,
          directory: Directory.Cache
        });

        await Share.share({
          title: 'Vistoria Técnica',
          text: 'PDF da Vistoria Técnica',
          url: savedFile.uri,
          dialogTitle: 'Abrir ou Salvar PDF'
        });
      } else {
        pdf.save(`${fileName}.pdf`);
      }

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
      if (tempContainer?.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
      dismissLoading();
    }
  };

  return { exportToPdf };
};
