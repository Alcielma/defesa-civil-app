import { Fragment } from 'react';
import {
  DadosIntervencoes,
  OPCOES_INDICACAO_INTERVENCAO,
  OPCOES_INTERVENCAO_COBERTA,
  OPCOES_INTERVENCAO_PAREDE,
  OPCOES_INTERVENCAO_PISO,
} from '../../../domain/entities';
import { CheckboxGroup, CheckboxOption, ImageUpload } from '../../../components';
import { toggleOpcao } from './toggleOpcao';
import './Etapa8.css';

export interface EtapaIntervencoesProps {
  dados: DadosIntervencoes;
  onChange: (dados: DadosIntervencoes) => void;
  erros?: Partial<Record<keyof DadosIntervencoes, string>>;
}

type CampoIntervencao = 'parede' | 'coberta' | 'indicacaoAtuacao' | 'indicacaoDemolicao' | 'piso';
type CampoImagemIntervencao = `imagem${Capitalize<CampoIntervencao>}`;

const GRUPOS: {
  campo: CampoIntervencao;
  campoImagem: CampoImagemIntervencao;
  label: string;
  labelImagem: string;
  opcoes: string[];
}[] = [
  { campo: 'parede', campoImagem: 'imagemParede', labelImagem: 'Imagem da parede', label: 'Parede', opcoes: OPCOES_INTERVENCAO_PAREDE },
  { campo: 'coberta', campoImagem: 'imagemCoberta', labelImagem: 'Imagem da coberta', label: 'Coberta', opcoes: OPCOES_INTERVENCAO_COBERTA },
  { campo: 'indicacaoAtuacao', campoImagem: 'imagemIndicacaoAtuacao', labelImagem: 'Imagem da indicação de atuação', label: 'Indicação de atuação', opcoes: OPCOES_INDICACAO_INTERVENCAO },
  { campo: 'indicacaoDemolicao', campoImagem: 'imagemIndicacaoDemolicao', labelImagem: 'Imagem da indicação de demolição', label: 'Indicação de demolição', opcoes: OPCOES_INDICACAO_INTERVENCAO },
  { campo: 'piso', campoImagem: 'imagemPiso', labelImagem: 'Imagem do piso', label: 'Piso', opcoes: OPCOES_INTERVENCAO_PISO },
];

const EtapaIntervencoes = ({
  dados,
  onChange,
  erros,
}: EtapaIntervencoesProps) => {
  const handleOpcao = (campo: CampoIntervencao, opcao: string) => {
    onChange({ ...dados, [campo]: toggleOpcao(dados[campo], opcao) });
  };

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Intervenções</h2>
        <p className="etapa-card__subtitulo">
          Medidas necessárias no imóvel
        </p>
      </header>

      <div className="etapa-card__campos">
        {GRUPOS.map(({ campo, campoImagem, label, labelImagem, opcoes }) => (
          <Fragment key={campo}>
            <CheckboxGroup
              label={label}
              helperText="Marque todas as medidas necessárias."
              error={erros?.[campo]}
            >
              {opcoes.map((opcao) => (
                <CheckboxOption
                  key={opcao}
                  label={opcao}
                  checked={dados[campo].includes(opcao)}
                  onChange={() => handleOpcao(campo, opcao)}
                />
              ))}
            </CheckboxGroup>

            <ImageUpload
              label={labelImagem}
              value={dados[campoImagem]}
              onChange={(imagem) => onChange({ ...dados, [campoImagem]: imagem })}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default EtapaIntervencoes;
