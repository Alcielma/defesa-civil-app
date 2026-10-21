import { Button } from '../../components';
import './FormularioConcluido.css';

export interface FormularioConcluidoProps {
  onVisualizarDocumento: () => void;
}

const FormularioConcluido = ({ onVisualizarDocumento }: FormularioConcluidoProps) => {
  return (
    <div className="etapa-card formulario-concluido">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Formulário concluído!</h2>
        <p className="etapa-card__subtitulo">
          Visualize o documento preenchido e, após conferir as informações, faça o
          download em PDF
        </p>
      </header>

      <div className="formulario-concluido__acao">
        <Button variant="primary" size="lg" onClick={onVisualizarDocumento}>
          Visualizar documento
        </Button>
      </div>
    </div>
  );
};

export default FormularioConcluido;
