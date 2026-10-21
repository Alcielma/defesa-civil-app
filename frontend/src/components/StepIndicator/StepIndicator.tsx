import { Fragment } from 'react';
import { ETAPAS_FORMULARIO } from '../../domain/entities';
import './StepIndicator.css';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export interface StepIndicatorProps {
  etapaAtual: number;
  totalEtapas?: number;
  tituloEtapa?: string;
  /** Quando `true`, troca as bolinhas pela mensagem "Concluído". */
  concluido?: boolean;
}

const StepIndicator = ({
  etapaAtual,
  totalEtapas = ETAPAS_FORMULARIO.length,
  tituloEtapa,
  concluido = false,
}: StepIndicatorProps) => {
  const etapaInfo = ETAPAS_FORMULARIO[etapaAtual - 1];
  const titulo = tituloEtapa || etapaInfo?.titulo || `Etapa ${etapaAtual}`;
  const percentual = concluido ? 100 : Math.round((etapaAtual / totalEtapas) * 100);

  const etapasVisiveis = Math.min(totalEtapas, 7);
  const primeiraVisivel = Math.max(
    1,
    Math.min(etapaAtual - 4, totalEtapas - etapasVisiveis + 1)
  );
  const ultimaVisivel = primeiraVisivel + etapasVisiveis - 1;
  const etapasArray = Array.from({ length: etapasVisiveis }, (_, i) => primeiraVisivel + i);

  return (
    <div className="step-indicator" data-etapa-atual={etapaAtual}>
      <div className="step-indicator__linha-superior">
        <span className="step-indicator__contador">
          Etapas {etapaAtual} de {totalEtapas}
        </span>
        <span className="step-indicator__percentual">{percentual}%</span>
      </div>

      {concluido ? (
        <p className="step-indicator__concluido" role="status">
          Concluído
          <CheckIcon />
        </p>
      ) : (
        <div className="step-indicator__bolinhas" role="list" aria-label="Progresso das etapas">
          {etapasArray.map((num) => {
            const isCurrent = num === etapaAtual;
            const isPast = num < etapaAtual;
            const classes = [
              'step-indicator__bolinha',
              isCurrent ? 'step-indicator__bolinha--atual' : '',
              isPast ? 'step-indicator__bolinha--passada' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <Fragment key={num}>
                <div
                  role="listitem"
                  className={classes}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Etapa ${num}${isCurrent ? ' - etapa atual' : ''}`}
                >
                  <span className="step-indicator__numero">{num}</span>
                </div>
                {num < ultimaVisivel && (
                  <span
                    className={[
                      'step-indicator__conector',
                      isPast ? 'step-indicator__conector--ativo' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StepIndicator;
