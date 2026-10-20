const carregarImagem = (arquivo: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Imagem inválida'));
    };
    img.src = url;
  });

/**
 * Redimensiona a imagem para que o maior lado tenha no máximo `dimensaoMaxima`
 * e a converte para JPEG com a `qualidade` informada.
 * Uma foto de câmera de ~4 MB costuma cair para ~150–300 KB.
 */
export const compactarImagem = async (
  arquivo: Blob,
  dimensaoMaxima = 1280,
  qualidade = 0.7
): Promise<string> => {
  const img = await carregarImagem(arquivo);
  const escala = Math.min(1, dimensaoMaxima / Math.max(img.width, img.height));
  const largura = Math.round(img.width * escala);
  const altura = Math.round(img.height * escala);

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');

  // Fundo branco: PNGs com transparência ficariam pretos no JPEG.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, largura, altura);
  ctx.drawImage(img, 0, 0, largura, altura);

  return canvas.toDataURL('image/jpeg', qualidade);
};
