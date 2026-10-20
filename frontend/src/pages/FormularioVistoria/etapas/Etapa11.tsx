import { DadosGrauRisco, OPCOES_GRAU_RISCO } from '../../../domain/entities';
import { CheckboxGroup, CheckboxOption } from '../../../components';
import './Etapa11.css';

export interface EtapaGrauRiscoProps {
  dados: DadosGrauRisco;
  onChange: (dados: DadosGrauRisco) => void;
  erros?: {
    grauRisco?: string;
  };
}

const COR_GRAU_RISCO: Record<string, string> = {
  'R1 Baixo': '#22a33a',
  'R2 Médio': '#8a7d00',
  'R3 Alto': '#f06a0a',
  'R4 Muito Alto': '#d40000',
};

const EtapaGrauRisco = ({
  dados,
  onChange,
  erros,
}: EtapaGrauRiscoProps) => {
  // Classificação final: só um grau pode ficar marcado por vez.
  const handleGrauRisco = (opcao: string) => {
    onChange({
      ...dados,
      grauRisco: dados.grauRisco === opcao ? '' : opcao,
    });
  };

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Grau de risco</h2>
        <p className="etapa-card__subtitulo">
          Classificação final da vistoria
        </p>
      </header>

      <div className="etapa-card__campos">
        <CheckboxGroup
          label="Grau de risco"
          helperText="Marque o grau de risco do imóvel."
          error={erros?.grauRisco}
        >
          {OPCOES_GRAU_RISCO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              leftIcon={
                <span
                  className="etapa-grau-risco__cor"
                  style={{ background: COR_GRAU_RISCO[opcao] }}
                />
              }
              checked={dados.grauRisco === opcao}
              onChange={() => handleGrauRisco(opcao)}
            />
          ))}
        </CheckboxGroup>
      </div>
    </div>
  );
};

export default EtapaGrauRisco;
