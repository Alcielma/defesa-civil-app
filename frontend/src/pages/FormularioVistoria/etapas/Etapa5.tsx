import {
  DadosRevestimentos,
  OPCAO_COBERTURA_OUTRO,
  OPCAO_REVESTIMENTO_OUTRO,
  OPCOES_COBERTURA,
  OPCOES_REVESTIMENTO,
} from '../../../domain/entities';
import { CheckboxGroup, CheckboxOption, Input, ImageUpload } from '../../../components';
import { toggleOpcao } from './toggleOpcao';
import './Etapa5.css';

export interface EtapaRevestimentosProps {
  dados: DadosRevestimentos;
  onChange: (dados: DadosRevestimentos) => void;
  erros?: Partial<Record<keyof DadosRevestimentos, string>>;
}

const EtapaRevestimentos = ({
  dados,
  onChange,
  erros,
}: EtapaRevestimentosProps) => {
  const setCampo = (
    campo: 'percentualRevestimentoInterno' | 'outroRevestimentoExternoEspecificacao' |
      'outroRevestimentoInternoEspecificacao' | 'outraCoberturaEspecificacao',
    valor: string
  ) => {
    onChange({ ...dados, [campo]: valor });
  };

  const handleRevestimentoExterno = (opcao: string) => {
    const revestimentoExterno = toggleOpcao(dados.revestimentoExterno, opcao);
    onChange({
      ...dados,
      revestimentoExterno,
      outroRevestimentoExternoEspecificacao: revestimentoExterno.includes(OPCAO_REVESTIMENTO_OUTRO)
        ? dados.outroRevestimentoExternoEspecificacao
        : '',
    });
  };

  const handleRevestimentoInterno = (opcao: string) => {
    const revestimentoInterno = toggleOpcao(dados.revestimentoInterno, opcao);
    onChange({
      ...dados,
      revestimentoInterno,
      outroRevestimentoInternoEspecificacao: revestimentoInterno.includes(OPCAO_REVESTIMENTO_OUTRO)
        ? dados.outroRevestimentoInternoEspecificacao
        : '',
    });
  };

  const handleCobertura = (opcao: string) => {
    const cobertura = toggleOpcao(dados.cobertura, opcao);
    onChange({
      ...dados,
      cobertura,
      outraCoberturaEspecificacao: cobertura.includes(OPCAO_COBERTURA_OUTRO)
        ? dados.outraCoberturaEspecificacao
        : '',
    });
  };

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Revestimentos</h2>
        <p className="etapa-card__subtitulo">
          Acabamento externo, interno e cobertura
        </p>
      </header>

      <div className="etapa-card__campos">
        <CheckboxGroup
          label="Revestimento externo"
          helperText="Marque todas as opções encontradas."
          error={erros?.revestimentoExterno}
        >
          {OPCOES_REVESTIMENTO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.revestimentoExterno.includes(opcao)}
              onChange={() => handleRevestimentoExterno(opcao)}
            />
          ))}
        </CheckboxGroup>

        {dados.revestimentoExterno.includes(OPCAO_REVESTIMENTO_OUTRO) && (
          <Input
            label="Especifique o revestimento externo"
            placeholder="Especifique, se necessário"
            value={dados.outroRevestimentoExternoEspecificacao}
            onChange={(e) => setCampo('outroRevestimentoExternoEspecificacao', e.target.value)}
            error={erros?.outroRevestimentoExternoEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem do revestimento externo"
          value={dados.imagemRevestimentoExterno}
          onChange={(imagemRevestimentoExterno) => onChange({ ...dados, imagemRevestimentoExterno })}
        />

        <Input
          label="Percentual do revestimento interno"
          placeholder="Ex: 50"
          inputMode="decimal"
          value={dados.percentualRevestimentoInterno}
          onChange={(e) => setCampo('percentualRevestimentoInterno', e.target.value)}
          error={erros?.percentualRevestimentoInterno}
        />

        <CheckboxGroup
          label="Revestimento interno"
          helperText="Marque todas as opções encontradas."
          error={erros?.revestimentoInterno}
        >
          {OPCOES_REVESTIMENTO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.revestimentoInterno.includes(opcao)}
              onChange={() => handleRevestimentoInterno(opcao)}
            />
          ))}
        </CheckboxGroup>

        {dados.revestimentoInterno.includes(OPCAO_REVESTIMENTO_OUTRO) && (
          <Input
            label="Especifique o revestimento interno"
            placeholder="Especifique, se necessário"
            value={dados.outroRevestimentoInternoEspecificacao}
            onChange={(e) => setCampo('outroRevestimentoInternoEspecificacao', e.target.value)}
            error={erros?.outroRevestimentoInternoEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem do revestimento interno"
          value={dados.imagemRevestimentoInterno}
          onChange={(imagemRevestimentoInterno) => onChange({ ...dados, imagemRevestimentoInterno })}
        />

        <CheckboxGroup
          label="Cobertura"
          helperText="Marque todos os tipos de cobertura encontrados."
          error={erros?.cobertura}
        >
          {OPCOES_COBERTURA.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.cobertura.includes(opcao)}
              onChange={() => handleCobertura(opcao)}
            />
          ))}
        </CheckboxGroup>

        {dados.cobertura.includes(OPCAO_COBERTURA_OUTRO) && (
          <Input
            label="Especifique a cobertura"
            placeholder="Especifique, se necessário"
            value={dados.outraCoberturaEspecificacao}
            onChange={(e) => setCampo('outraCoberturaEspecificacao', e.target.value)}
            error={erros?.outraCoberturaEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem da cobertura"
          value={dados.imagemCobertura}
          onChange={(imagemCobertura) => onChange({ ...dados, imagemCobertura })}
        />
      </div>
    </div>
  );
};

export default EtapaRevestimentos;
