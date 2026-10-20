import { DadosConclusao } from '../../../domain/entities';
import { Input } from '../../../components';
import './Etapa12.css';

export interface EtapaConclusaoProps {
  dados: DadosConclusao;
  onChange: (dados: DadosConclusao) => void;
  erros?: Partial<Record<keyof DadosConclusao, string>>;
}

const EtapaConclusao = ({
  dados,
  onChange,
  erros,
}: EtapaConclusaoProps) => {
  const setCampo = (campo: keyof DadosConclusao, valor: string) => {
    onChange({ ...dados, [campo]: valor });
  };

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Conclusão</h2>
        <p className="etapa-card__subtitulo">
          Responsáveis, matrícula, carimbo e data
        </p>
      </header>

      <div className="etapa-card__campos">
        <Input
          label="Analista / Técnico"
          placeholder="Nome e matrícula"
          value={dados.analistaTecnico}
          onChange={(e) => setCampo('analistaTecnico', e.target.value)}
          error={erros?.analistaTecnico}
        />

        <Input
          label="Chefia / Gerente"
          placeholder="Nome e matrícula"
          value={dados.chefiaGerente}
          onChange={(e) => setCampo('chefiaGerente', e.target.value)}
          error={erros?.chefiaGerente}
        />

        <Input
          label="Data"
          type="date"
          value={dados.data}
          onChange={(e) => setCampo('data', e.target.value)}
          error={erros?.data}
        />
      </div>
    </div>
  );
};

export default EtapaConclusao;
