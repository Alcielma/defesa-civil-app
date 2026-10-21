import { useState } from 'react';
import { useIonActionSheet } from '@ionic/react';
import { Camera, MediaResult } from '@capacitor/camera';
import { cameraOutline, close, imagesOutline } from 'ionicons/icons';
import { compactarImagem } from '../../utils/compactarImagem';
import './ImageUpload.css';

/**
 * Propriedades do componente ImageUpload.
 */
export interface ImageUploadProps {
  /** Label exibida ACIMA da área de upload. */
  label?: string;
  /** Texto principal da área vazia. Default: `Adicionar imagem`. */
  placeholder?: string;
  /** Texto secundário da área vazia. */
  placeholderSub?: string;
  /** Imagem atual em base64 (data URL). String vazia = sem imagem. */
  value: string;
  /** Chamado com a imagem em base64 (data URL), ou `''` ao remover. */
  onChange: (base64: string) => void;
  /** Mensagem de erro (texto em vermelho, borda vermelha). */
  error?: string;
  /** Desabilita a seleção e a remoção. */
  disabled?: boolean;
  /** Maior lado (largura ou altura) da imagem final, em px. Default: `1280`. */
  dimensaoMaxima?: number;
  /** Qualidade do JPEG final, de 0 a 1. Default: `0.7`. */
  qualidade?: number;
}

type OrigemImagem = 'camera' | 'galeria';

const ImagePlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 5h6"/>
    <path d="M19 2v6"/>
    <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    <circle cx="9" cy="9" r="2"/>
  </svg>
);

/** Abre a câmera ou a galeria e devolve a mídia escolhida (ou `undefined`). */
const obterMidia = async (origem: OrigemImagem): Promise<MediaResult | undefined> => {
  if (origem === 'camera') {
    return Camera.takePhoto({ webUseInput: true });
  }
  const { results } = await Camera.chooseFromGallery({ limit: 1, webUseInput: true });
  return results[0];
};

/** O plugin rejeita a Promise quando o usuário fecha a câmera/galeria sem escolher. */
const foiCancelado = (erro: unknown) =>
  erro instanceof Error && /cancel/i.test(erro.message);

/**
 * Campo de upload de uma única foto, com pré-visualização e botões
 * para trocar ou remover.
 *
 * Ao tocar, pergunta se o usuário quer tirar uma foto com a câmera ou
 * escolher da galeria. A imagem escolhida é compactada (redimensionada + JPEG)
 * e entregue na hora como data URL em base64.
 *
 * @example
 * <ImageUpload
 *   label="Foto da estrutura"
 *   value={foto}
 *   onChange={setFoto}
 * />
 */
const ImageUpload = ({
  label,
  placeholder = 'Adicionar imagem',
  placeholderSub = 'Toque para tirar foto ou escolher da galeria',
  value,
  onChange,
  error,
  disabled = false,
  dimensaoMaxima = 1280,
  qualidade = 0.7,
}: ImageUploadProps) => {
  const [presentActionSheet] = useIonActionSheet();
  const [erroLeitura, setErroLeitura] = useState('');
  const [processando, setProcessando] = useState(false);

  const bloqueado = disabled || processando;

  const carregar = async (origem: OrigemImagem) => {
    setErroLeitura('');
    try {
      const midia = await obterMidia(origem);
      if (!midia?.webPath) return;
      setProcessando(true);
      const arquivo = await (await fetch(midia.webPath)).blob();
      onChange(await compactarImagem(arquivo, dimensaoMaxima, qualidade));
    } catch (erro) {
      if (!foiCancelado(erro)) {
        setErroLeitura('Não foi possível carregar a imagem');
      }
    } finally {
      setProcessando(false);
    }
  };

  const abrirOpcoes = () => {
    if (bloqueado) return;
    presentActionSheet({
      header: label ?? 'Adicionar imagem',
      buttons: [
        {
          text: 'Tirar foto',
          icon: cameraOutline,
          handler: () => {
            carregar('camera');
          },
        },
        {
          text: 'Escolher da galeria',
          icon: imagesOutline,
          handler: () => {
            carregar('galeria');
          },
        },
        { text: 'Cancelar', icon: close, role: 'cancel' },
      ],
    });
  };

  const mensagemErro = error || erroLeitura;

  const classes = [
    'app-image-upload',
    mensagemErro ? 'app-image-upload--error' : '',
    disabled ? 'app-image-upload--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {label && <span className="app-image-upload__label">{label}</span>}

      {value ? (
        <div className="app-image-upload__preview">
          <img src={value} alt={label ?? 'Imagem selecionada'} />
          <div className="app-image-upload__acoes">
            <button type="button" onClick={abrirOpcoes} disabled={bloqueado}>
              {processando ? 'Processando…' : 'Trocar'}
            </button>
            <button
              type="button"
              className="app-image-upload__remover"
              onClick={() => onChange('')}
              disabled={bloqueado}
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="app-image-upload__vazio"
          onClick={abrirOpcoes}
          disabled={bloqueado}
        >
          <ImagePlusIcon />
          <span className="app-image-upload__placeholder">
            {processando ? 'Processando imagem…' : placeholder}
          </span>
          {placeholderSub && !processando && (
            <span className="app-image-upload__placeholder-sub">{placeholderSub}</span>
          )}
        </button>
      )}

      {mensagemErro && <span className="app-image-upload__error">{mensagemErro}</span>}
    </div>
  );
};

export default ImageUpload;
