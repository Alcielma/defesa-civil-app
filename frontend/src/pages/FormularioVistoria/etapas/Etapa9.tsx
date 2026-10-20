import { DadosObservacao } from '../../../domain/entities';
import { TextArea } from '../../../components';
import './Etapa9.css';

export interface EtapaObservacaoProps {
  dados: DadosObservacao;
  onChange: (dados: DadosObservacao) => void;
  erros?: {
    observacoes?: string;
  };
}

const EtapaObservacao = ({
  dados,
  onChange,
  erros,
}: EtapaObservacaoProps) => {
  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Observação</h2>
        <p className="etapa-card__subtitulo">
          Registro técnico livre da vistoria
        </p>
      </header>

      <div className="etapa-card__campos">
        <TextArea
          label="Observações"
          placeholder="Descreva as condições encontradas, evidências, orientações dadas e demais informações relevantes"
          rows={6}
          value={dados.observacoes}
          onChange={(e) => onChange({ ...dados, observacoes: e.target.value })}
          error={erros?.observacoes}
        />
      </div>
    </div>
  );
};

export default EtapaObservacao;
