import { DadosIdentificacao } from '../../../domain/entities';
import { Input } from '../../../components';
import './Etapa1.css';

export interface EtapaIdentificacaoProps {
  dados: DadosIdentificacao;
  onChange: (dados: DadosIdentificacao) => void;
  erros?: Partial<Record<keyof DadosIdentificacao, string>>;
}

const EtapaIdentificacao = ({ dados, onChange, erros }: EtapaIdentificacaoProps) => {
  const handleChange = (campo: keyof DadosIdentificacao, valor: string) => {
    onChange({ ...dados, [campo]: valor });
  };

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Identificação</h2>
        <p className="etapa-card__subtitulo">Dados básicos do imóvel e do titular</p>
      </header>

      <div className="etapa-card__campos">
        <Input
          label="Localidade"
          placeholder="Ex: Garanhuns, Brejão, etc"
          value={dados.localidade}
          onChange={(e) => handleChange('localidade', e.target.value)}
          error={erros?.localidade}
        />

        <Input
          label="Setor (opcional)"
          placeholder="Ex: Setor Residencial, Centro, etc"
          value={dados.setor}
          onChange={(e) => handleChange('setor', e.target.value)}
          error={erros?.setor}
        />

        <Input
          label="Titular"
          placeholder="Nome completo do responsável pelo imóvel"
          value={dados.titular}
          onChange={(e) => handleChange('titular', e.target.value)}
          error={erros?.titular}
        />

        <Input
          label="Endereço"
          placeholder="Rua, Avenida, Travessa..."
          value={dados.endereco}
          onChange={(e) => handleChange('endereco', e.target.value)}
          error={erros?.endereco}
        />

        <Input
          label="N° (opcional)"
          placeholder="Número do imóvel"
          value={dados.numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          error={erros?.numero}
          inputMode="numeric"
        />
      </div>
    </div>
  );
};

export default EtapaIdentificacao;
