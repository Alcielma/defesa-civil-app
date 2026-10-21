import { Vistoria, StatusVistoria } from '../../domain/entities';
import './VistoriaCard.css';

export interface VistoriaCardProps {
  vistoria: Vistoria;
  onContinuar?: (vistoria: Vistoria) => void;
  onVerDetalhes?: (vistoria: Vistoria) => void;
}

const LABEL_STATUS: Record<StatusVistoria, string> = {
  [StatusVistoria.PENDENTE]: 'Pendente',
  [StatusVistoria.EM_CURSO]: 'Em Andamento',
  [StatusVistoria.CONCLUIDA]: 'Concluído',
};

const VistoriaCard = ({
  vistoria,
  onContinuar,
  onVerDetalhes,
}: VistoriaCardProps) => {
  const isConcluida = vistoria.status === StatusVistoria.CONCLUIDA;

  const handleAcaoClick = () => {
    if (isConcluida) {
      onVerDetalhes?.(vistoria);
    } else {
      onContinuar?.(vistoria);
    }
  };

  return (
    <article className="vistoria-card">
      <header className="vistoria-card__header">
        <h3 className="vistoria-card__nome">{vistoria.nomeSolicitante}</h3>
        <p className="vistoria-card__endereco">{vistoria.endereco}</p>
      </header>

      <footer className="vistoria-card__footer">
        <span className={`vistoria-card__status vistoria-card__status--${vistoria.status.toLowerCase()}`}>
          <span className="vistoria-card__status-dot" aria-hidden="true" />
          {LABEL_STATUS[vistoria.status]}
        </span>

        <span className="vistoria-card__protocolo">prot. {vistoria.protocolo}</span>

        <button
          type="button"
          className={`vistoria-card__acao vistoria-card__acao--${isConcluida ? 'detalhes' : 'continuar'}`}
          onClick={handleAcaoClick}
        >
          {isConcluida ? 'Ver detalhes' : 'Continuar'}
          <span className="vistoria-card__seta" aria-hidden="true">{'>'}</span>
        </button>
      </footer>
    </article>
  );
};

export default VistoriaCard;
