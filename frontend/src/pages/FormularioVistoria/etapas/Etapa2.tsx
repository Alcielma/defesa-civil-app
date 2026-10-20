import {
  DadosCaracteristicasImovel,
  OPCOES_LOCALIZACAO,
  OPCOES_PRINCIPAIS_CAUSAS,
} from '../../../domain/entities';
import {
  CheckboxGroup,
  CheckboxOption,
  ImageUpload,
  RadioGroup,
  RadioOption,
} from '../../../components';
import { toggleOpcao } from './toggleOpcao';
import './Etapa2.css';

export interface EtapaCaracteristicasImovelProps {
  dados: DadosCaracteristicasImovel;
  onChange: (dados: DadosCaracteristicasImovel) => void;
  erros?: {
    localizacao?: string;
    principaisCausas?: string;
  };
}

const EtapaCaracteristicasImovel = ({
  dados,
  onChange,
  erros,
}: EtapaCaracteristicasImovelProps) => {
  const handleCausa = (valor: string) => {
    onChange({
      ...dados,
      principaisCausas: toggleOpcao(dados.principaisCausas, valor),
    });
  };

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Características do imóvel</h2>
        <p className="etapa-card__subtitulo">
          Informações sobre o terreno e os riscos observados
        </p>
      </header>

      <div className="etapa-card__campos">
        <RadioGroup
          label="Localização"
          helperText="Selecione a localização do imóvel."
          error={erros?.localizacao}
          required
        >
          {OPCOES_LOCALIZACAO.map(({ valor, rotulo }) => (
            <RadioOption
              key={valor}
              label={rotulo}
              checked={dados.localizacao === valor}
              onChange={() => onChange({ ...dados, localizacao: valor })}
            />
          ))}
        </RadioGroup>

        <ImageUpload
          label="Imagem da localização"
          value={dados.imagemLocalizacao}
          onChange={(imagemLocalizacao) => onChange({ ...dados, imagemLocalizacao })}
        />

        <CheckboxGroup
          label="Principais causas de problemas"
          helperText="Selecione todas as causas identificadas no local."
          error={erros?.principaisCausas}
        >
          {OPCOES_PRINCIPAIS_CAUSAS.map(({ valor, rotulo }) => (
            <CheckboxOption
              key={valor}
              label={rotulo}
              checked={dados.principaisCausas.includes(valor)}
              onChange={() => handleCausa(valor)}
            />
          ))}
        </CheckboxGroup>

        <ImageUpload
          label="Imagem das principais causas"
          value={dados.imagemPrincipaisCausas}
          onChange={(imagemPrincipaisCausas) => onChange({ ...dados, imagemPrincipaisCausas })}
        />
      </div>
    </div>
  );
};

export default EtapaCaracteristicasImovel;
