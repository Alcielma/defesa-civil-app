import { Button } from '../../components';
import './FormularioConcluido.css';

export interface FormularioConcluidoProps {
  onVisualizarDocumento: () => void;
  onVoltarHome: () => void;
}

const FormularioConcluido = ({
  onVisualizarDocumento,
  onVoltarHome,
}: FormularioConcluidoProps) => {
  return (
    <div className="formulario-concluido-overlay">
      <div className="formulario-concluido-card">
        <header className="formulario-concluido-card__cabecalho">
          <h2 className="formulario-concluido-card__titulo">
            Formulário concluído!
          </h2>
          <p className="formulario-concluido-card__subtitulo">
            Escolha uma das opções abaixo para prosseguir com o documento
          </p>
        </header>

        <div className="formulario-concluido-card__acoes">
          <Button variant="primary" size="lg" onClick={onVisualizarDocumento} fullWidth>
            Visualizar documento
          </Button>
          <Button variant="ghost" size="md" onClick={onVoltarHome} fullWidth className="btn-voltar-home">
            Voltar para Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormularioConcluido;
