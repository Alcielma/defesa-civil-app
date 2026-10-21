import {
  DadosDestinos,
  OPCAO_DESTINO_OUTRO,
  OPCOES_DESTINO_AGUAS_SERVIDAS,
  OPCOES_DESTINO_ESGOTO,
  OPCOES_DESTINO_LIXO,
} from '../../../domain/entities';
import { CheckboxGroup, CheckboxOption, Input, ImageUpload } from '../../../components';
import { toggleOpcao } from './toggleOpcao';
import './Etapa7.css';

export interface EtapaDestinosProps {
  dados: DadosDestinos;
  onChange: (dados: DadosDestinos) => void;
  erros?: Partial<Record<keyof DadosDestinos, string>>;
}

const EtapaDestinos = ({
  dados,
  onChange,
  erros,
}: EtapaDestinosProps) => {
  const setCampo = (
    campo: 'outroDestinoEsgotoEspecificacao' | 'outroDestinoAguasServidasEspecificacao' |
      'outroDestinoLixoEspecificacao',
    valor: string
  ) => {
    onChange({ ...dados, [campo]: valor });
  };

  const handleDestinoEsgoto = (opcao: string) => {
    const destinoEsgoto = toggleOpcao(dados.destinoEsgoto, opcao);
    onChange({
      ...dados,
      destinoEsgoto,
      outroDestinoEsgotoEspecificacao: destinoEsgoto.includes(OPCAO_DESTINO_OUTRO)
        ? dados.outroDestinoEsgotoEspecificacao
        : '',
    });
  };

  const handleDestinoAguasServidas = (opcao: string) => {
    const destinoAguasServidas = toggleOpcao(dados.destinoAguasServidas, opcao);
    onChange({
      ...dados,
      destinoAguasServidas,
      outroDestinoAguasServidasEspecificacao: destinoAguasServidas.includes(OPCAO_DESTINO_OUTRO)
        ? dados.outroDestinoAguasServidasEspecificacao
        : '',
    });
  };

  const handleDestinoLixo = (opcao: string) => {
    const destinoLixo = toggleOpcao(dados.destinoLixo, opcao);
    onChange({
      ...dados,
      destinoLixo,
      outroDestinoLixoEspecificacao: destinoLixo.includes(OPCAO_DESTINO_OUTRO)
        ? dados.outroDestinoLixoEspecificacao
        : '',
    });
  };

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Destinos</h2>
        <p className="etapa-card__subtitulo">
          Esgotos, águas servidas, lixo e ocupação
        </p>
      </header>

      <div className="etapa-card__campos">
        <CheckboxGroup
          label="Destino do esgoto primário"
          helperText="Marque todos os destinos observados."
          error={erros?.destinoEsgoto}
        >
          {OPCOES_DESTINO_ESGOTO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.destinoEsgoto.includes(opcao)}
              onChange={() => handleDestinoEsgoto(opcao)}
            />
          ))}
        </CheckboxGroup>

        {dados.destinoEsgoto.includes(OPCAO_DESTINO_OUTRO) && (
          <Input
            label="Especifique o destino do esgoto"
            placeholder="Especifique, se necessário"
            value={dados.outroDestinoEsgotoEspecificacao}
            onChange={(e) => setCampo('outroDestinoEsgotoEspecificacao', e.target.value)}
            error={erros?.outroDestinoEsgotoEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem do destino do esgoto"
          value={dados.imagemDestinoEsgoto}
          onChange={(imagemDestinoEsgoto) => onChange({ ...dados, imagemDestinoEsgoto })}
        />

        <CheckboxGroup
          label="Destino das águas servidas"
          helperText="Marque todos os destinos observados."
          error={erros?.destinoAguasServidas}
        >
          {OPCOES_DESTINO_AGUAS_SERVIDAS.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.destinoAguasServidas.includes(opcao)}
              onChange={() => handleDestinoAguasServidas(opcao)}
            />
          ))}
        </CheckboxGroup>

        {dados.destinoAguasServidas.includes(OPCAO_DESTINO_OUTRO) && (
          <Input
            label="Especifique o destino das águas servidas"
            placeholder="Especifique, se necessário"
            value={dados.outroDestinoAguasServidasEspecificacao}
            onChange={(e) => setCampo('outroDestinoAguasServidasEspecificacao', e.target.value)}
            error={erros?.outroDestinoAguasServidasEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem do destino das águas servidas"
          value={dados.imagemDestinoAguasServidas}
          onChange={(imagemDestinoAguasServidas) => onChange({ ...dados, imagemDestinoAguasServidas })}
        />

        <CheckboxGroup
          label="Destino do lixo"
          helperText="Marque todos os destinos observados."
          error={erros?.destinoLixo}
        >
          {OPCOES_DESTINO_LIXO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.destinoLixo.includes(opcao)}
              onChange={() => handleDestinoLixo(opcao)}
            />
          ))}
        </CheckboxGroup>

        {dados.destinoLixo.includes(OPCAO_DESTINO_OUTRO) && (
          <Input
            label="Especifique o destino do lixo"
            placeholder="Especifique, se necessário"
            value={dados.outroDestinoLixoEspecificacao}
            onChange={(e) => setCampo('outroDestinoLixoEspecificacao', e.target.value)}
            error={erros?.outroDestinoLixoEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem do destino do lixo"
          value={dados.imagemDestinoLixo}
          onChange={(imagemDestinoLixo) => onChange({ ...dados, imagemDestinoLixo })}
        />
      </div>
    </div>
  );
};

export default EtapaDestinos;
