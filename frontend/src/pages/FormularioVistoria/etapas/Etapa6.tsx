import {
  DadosConservacao,
  OPCAO_SANITARIO_OUTRO,
  OPCOES_ESTADO_CONSERVACAO,
  OPCOES_INSTALACAO_ELETRICA,
  OPCOES_SANITARIO,
} from '../../../domain/entities';
import { CheckboxGroup, CheckboxOption, Input, ImageUpload } from '../../../components';
import { toggleOpcao } from './toggleOpcao';
import './Etapa6.css';

export interface EtapaConservacaoProps {
  dados: DadosConservacao;
  onChange: (dados: DadosConservacao) => void;
  erros?: {
    conservacaoCobertura?: string;
    conservacaoEdificacao?: string;
    instalacaoEletrica?: string;
    sanitario?: string;
    outroSanitarioEspecificacao?: string;
  };
}

const EtapaConservacao = ({
  dados,
  onChange,
  erros,
}: EtapaConservacaoProps) => {
  const handleOpcao = (
    campo: 'conservacaoCobertura' | 'conservacaoEdificacao' | 'instalacaoEletrica',
    opcao: string
  ) => {
    onChange({ ...dados, [campo]: toggleOpcao(dados[campo], opcao) });
  };

  const handleSanitario = (opcao: string) => {
    const sanitario = toggleOpcao(dados.sanitario, opcao);
    onChange({
      ...dados,
      sanitario,
      outroSanitarioEspecificacao: sanitario.includes(OPCAO_SANITARIO_OUTRO)
        ? dados.outroSanitarioEspecificacao
        : '',
    });
  };

  const sanitarioOutroSelecionado = dados.sanitario.includes(OPCAO_SANITARIO_OUTRO);

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Conservação</h2>
        <p className="etapa-card__subtitulo">
          Estado do imóvel e instalação
        </p>
      </header>

      <div className="etapa-card__campos">
        <CheckboxGroup
          label="Estado de conservação da cobertura"
          helperText="Marque todas as situações observadas."
          error={erros?.conservacaoCobertura}
        >
          {OPCOES_ESTADO_CONSERVACAO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.conservacaoCobertura.includes(opcao)}
              onChange={() => handleOpcao('conservacaoCobertura', opcao)}
            />
          ))}
        </CheckboxGroup>

        <ImageUpload
          label="Imagem da conservação da cobertura"
          value={dados.imagemConservacaoCobertura}
          onChange={(imagemConservacaoCobertura) => onChange({ ...dados, imagemConservacaoCobertura })}
        />

        <CheckboxGroup
          label="Estado de conservação da edificação"
          helperText="Marque todas as situações observadas."
          error={erros?.conservacaoEdificacao}
        >
          {OPCOES_ESTADO_CONSERVACAO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.conservacaoEdificacao.includes(opcao)}
              onChange={() => handleOpcao('conservacaoEdificacao', opcao)}
            />
          ))}
        </CheckboxGroup>

        <ImageUpload
          label="Imagem da conservação da edificação"
          value={dados.imagemConservacaoEdificacao}
          onChange={(imagemConservacaoEdificacao) => onChange({ ...dados, imagemConservacaoEdificacao })}
        />

        <CheckboxGroup
          label="Instalação elétrica"
          helperText="Marque todas as situações observadas."
          error={erros?.instalacaoEletrica}
        >
          {OPCOES_INSTALACAO_ELETRICA.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.instalacaoEletrica.includes(opcao)}
              onChange={() => handleOpcao('instalacaoEletrica', opcao)}
            />
          ))}
        </CheckboxGroup>

        <ImageUpload
          label="Imagem da instalação elétrica"
          value={dados.imagemInstalacaoEletrica}
          onChange={(imagemInstalacaoEletrica) => onChange({ ...dados, imagemInstalacaoEletrica })}
        />

        <CheckboxGroup
          label="Sanitário"
          helperText="Marque todos os tipos de sanitário encontrados."
          error={erros?.sanitario}
        >
          {OPCOES_SANITARIO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.sanitario.includes(opcao)}
              onChange={() => handleSanitario(opcao)}
            />
          ))}
        </CheckboxGroup>

        {sanitarioOutroSelecionado && (
          <Input
            label="Especifique o tipo de sanitário"
            placeholder="Especifique, se necessário"
            value={dados.outroSanitarioEspecificacao}
            onChange={(e) => onChange({ ...dados, outroSanitarioEspecificacao: e.target.value })}
            error={erros?.outroSanitarioEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem do sanitário"
          value={dados.imagemSanitario}
          onChange={(imagemSanitario) => onChange({ ...dados, imagemSanitario })}
        />
      </div>
    </div>
  );
};

export default EtapaConservacao;
