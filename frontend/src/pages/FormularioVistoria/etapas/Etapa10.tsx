import {
  DadosRemocao,
  OPCAO_MOTIVO_REMOCAO_OUTRO,
  OPCOES_ENCAMINHAMENTOS,
  OPCOES_MOTIVO_REMOCAO,
} from '../../../domain/entities';
import { CheckboxGroup, CheckboxOption, Input, ImageUpload } from '../../../components';
import { toggleOpcao } from './toggleOpcao';
import './Etapa10.css';

export interface EtapaRemocaoProps {
  dados: DadosRemocao;
  onChange: (dados: DadosRemocao) => void;
  erros?: {
    motivoRemocao?: string;
    outroMotivoRemocaoEspecificacao?: string;
    encaminhamentos?: string;
  };
}

const EtapaRemocao = ({
  dados,
  onChange,
  erros,
}: EtapaRemocaoProps) => {
  const handleMotivoRemocao = (opcao: string) => {
    const motivoRemocao = toggleOpcao(dados.motivoRemocao, opcao);
    onChange({
      ...dados,
      motivoRemocao,
      outroMotivoRemocaoEspecificacao: motivoRemocao.includes(OPCAO_MOTIVO_REMOCAO_OUTRO)
        ? dados.outroMotivoRemocaoEspecificacao
        : '',
    });
  };

  const handleEncaminhamentos = (opcao: string) => {
    onChange({
      ...dados,
      encaminhamentos: toggleOpcao(dados.encaminhamentos, opcao),
    });
  };

  const motivoOutroSelecionado = dados.motivoRemocao.includes(OPCAO_MOTIVO_REMOCAO_OUTRO);

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Remoção e encaminhamento</h2>
        <p className="etapa-card__subtitulo">
          Motivo da remoção e providências indicadas
        </p>
      </header>

      <div className="etapa-card__campos">
        <CheckboxGroup
          label="Motivo da remoção"
          helperText="Marque todos os motivos que se aplicam."
          error={erros?.motivoRemocao}
        >
          {OPCOES_MOTIVO_REMOCAO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.motivoRemocao.includes(opcao)}
              onChange={() => handleMotivoRemocao(opcao)}
            />
          ))}
        </CheckboxGroup>

        {motivoOutroSelecionado && (
          <Input
            label="Especifique o motivo da remoção"
            placeholder="Especifique, se necessário"
            value={dados.outroMotivoRemocaoEspecificacao}
            onChange={(e) => onChange({ ...dados, outroMotivoRemocaoEspecificacao: e.target.value })}
            error={erros?.outroMotivoRemocaoEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem do motivo da remoção"
          value={dados.imagemMotivoRemocao}
          onChange={(imagemMotivoRemocao) => onChange({ ...dados, imagemMotivoRemocao })}
        />

        <CheckboxGroup
          label="Encaminhamentos"
          helperText="Marque todas as providências indicadas."
          error={erros?.encaminhamentos}
        >
          {OPCOES_ENCAMINHAMENTOS.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.encaminhamentos.includes(opcao)}
              onChange={() => handleEncaminhamentos(opcao)}
            />
          ))}
        </CheckboxGroup>

        <ImageUpload
          label="Imagem dos encaminhamentos"
          value={dados.imagemEncaminhamentos}
          onChange={(imagemEncaminhamentos) => onChange({ ...dados, imagemEncaminhamentos })}
        />
      </div>
    </div>
  );
};

export default EtapaRemocao;
