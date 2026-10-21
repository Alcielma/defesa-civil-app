import {
  DadosEstrutura,
  OPCAO_VEDACAO_OUTRO,
  OPCOES_ESTRUTURA,
  OPCOES_SITUACAO_PAREDE,
  OPCOES_VEDACAO,
} from '../../../domain/entities';
import {
  CheckboxGroup,
  CheckboxOption,
  ImageUpload,
  Input,
} from '../../../components';
import { toggleOpcao } from './toggleOpcao';
import './Etapa4.css';

export interface EtapaEstruturaProps {
  dados: DadosEstrutura;
  onChange: (dados: DadosEstrutura) => void;
  erros?: {
    estrutura?: string;
    vedacao?: string;
    outraVedacaoEspecificacao?: string;
    situacaoParede?: string;
  };
}

const EtapaEstrutura = ({
  dados,
  onChange,
  erros,
}: EtapaEstruturaProps) => {
  const handleEstrutura = (opcao: string) => {
    onChange({ ...dados, estrutura: toggleOpcao(dados.estrutura, opcao) });
  };

  const handleVedacao = (opcao: string) => {
    const vedacao = toggleOpcao(dados.vedacao, opcao);
    onChange({
      ...dados,
      vedacao,
      outraVedacaoEspecificacao: vedacao.includes(OPCAO_VEDACAO_OUTRO)
        ? dados.outraVedacaoEspecificacao
        : '',
    });
  };

  const handleSituacaoParede = (opcao: string) => {
    onChange({ ...dados, situacaoParede: toggleOpcao(dados.situacaoParede, opcao) });
  };

  const vedacaoOutroSelecionado = dados.vedacao.includes(OPCAO_VEDACAO_OUTRO);

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Padrão construtivo</h2>
        <p className="etapa-card__subtitulo">
          Estrutura, vedação e situação da parede
        </p>
      </header>

      <div className="etapa-card__campos">
        <CheckboxGroup
          label="Estrutura"
          helperText="Marque todos os tipos de estrutura encontrados."
          error={erros?.estrutura}
        >
          {OPCOES_ESTRUTURA.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.estrutura.includes(opcao)}
              onChange={() => handleEstrutura(opcao)}
            />
          ))}
        </CheckboxGroup>

        <ImageUpload
          label="Imagem da estrutura"
          value={dados.imagemEstrutura}
          onChange={(imagemEstrutura) => onChange({ ...dados, imagemEstrutura })}
        />

        <CheckboxGroup
          label="Vedação"
          helperText="Marque todos os tipos de vedação encontrados."
          error={erros?.vedacao}
        >
          {OPCOES_VEDACAO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.vedacao.includes(opcao)}
              onChange={() => handleVedacao(opcao)}
            />
          ))}
        </CheckboxGroup>

        {vedacaoOutroSelecionado && (
          <Input
            label="Especifique o tipo de vedação"
            placeholder="Especifique, se necessário"
            value={dados.outraVedacaoEspecificacao}
            onChange={(e) => onChange({ ...dados, outraVedacaoEspecificacao: e.target.value })}
            error={erros?.outraVedacaoEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem da vedação"
          value={dados.imagemVedacao}
          onChange={(imagemVedacao) => onChange({ ...dados, imagemVedacao })}
        />

        <CheckboxGroup
          label="Situação da parede"
          helperText="Marque todas as situações observadas."
          error={erros?.situacaoParede}
        >
          {OPCOES_SITUACAO_PAREDE.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.situacaoParede.includes(opcao)}
              onChange={() => handleSituacaoParede(opcao)}
            />
          ))}
        </CheckboxGroup>

        <ImageUpload
          label="Imagem da situação da parede"
          value={dados.imagemSituacaoParede}
          onChange={(imagemSituacaoParede) => onChange({ ...dados, imagemSituacaoParede })}
        />
      </div>
    </div>
  );
};

export default EtapaEstrutura;
