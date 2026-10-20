import './Loading.css';

/**
 * Tamanhos do spinner de loading.
 * - `sm` : 16px (ao lado de textos pequenos)
 * - `md` : 28px (padrão — formulários, botões, telas)
 * - `lg` : 48px (telas cheias, loadings de página)
 * - `xl` : 64px (loadings de inicialização / splash)
 */
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Modos de exibição do componente.
 * - `inline`  : fluxo normal (dentro de divs, sem ocupar a tela toda — ex: ao lado de um botão)
 * - `overlay` : posição ABSOLUTA, cobre o elemento PAI (necessita que o pai tenha `position: relative`)
 * - `screen`  : posição FIXA, cobre a TELA INTEIRA (usado em processamentos longos)
 */
export type LoadingVariant = 'overlay' | 'inline' | 'screen';

/**
 * Propriedades do componente Loading.
 * Todas as props são opcionais (há defaults sensatos).
 */
export interface LoadingProps {
  /** Tamanho do spinner. Default: `md`. */
  size?: LoadingSize;
  /** Modo de layout do componente. Default: `inline`. */
  variant?: LoadingVariant;
  /** Texto exibido ABAIXO do spinner (ex: "Autenticando...", "Carregando..."). */
  label?: string;
  /** Cor temática do spinner. Default: `orange`. */
  color?: 'orange' | 'blue' | 'white';
}

/**
 * Componente de feedback visual de loading (spinner animado + label opcional).
 *
 * Características:
 * - **Acessibilidade**: `role="status"` + `aria-live="polite"` — leitores de tela
 *   anunciam o conteúdo do label quando o componente aparecer na DOM.
 * - **3 modos de layout**: inline (fluxo), overlay (pai) e screen (tela cheia).
 * - **Cores temáticas**: alinhadas com a paleta do app (laranja, azul, branco).
 * - **Sem imagens**: spinner feito 100% com CSS (leve e escalável em qualquer resolução).
 *
 * @example
 * import Loading from '../../components/Loading';
 *
 * // Loading pequeno ao lado de texto (inline)
 * <Loading size="sm" color="orange" />
 *
 * // Loading de tela com mensagem
 * <Loading variant="screen" size="lg" label="Sincronizando vistorias..." />
 *
 * // Loading em cima de um container
 * <div style={{ position: 'relative', minHeight: 300 }}>
 *   <Loading variant="overlay" label="Carregando..." />
 * </div>
 */
const Loading = ({
  size = 'md',
  variant = 'inline',
  label,
  color = 'orange',
}: LoadingProps) => {
  const classes = [
    'app-loading',
    `app-loading--${variant}`,
    `app-loading--${size}`,
    `app-loading--${color}`,
  ].join(' ');

  return (
    <div className={classes} role="status" aria-live="polite">
      <span className="app-loading__spinner" />
      {label && <span className="app-loading__label">{label}</span>}
    </div>
  );
};

export default Loading;
