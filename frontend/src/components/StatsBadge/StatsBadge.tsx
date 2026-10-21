import { ContagemVistorias } from '../../domain/entities';
import './StatsBadge.css';

export interface StatsBadgeProps {
  contagem: ContagemVistorias;
}

const StatsBadge = ({ contagem }: StatsBadgeProps) => {
  return (
    <div className="stats-badge">
      <div className="stats-badge__item stats-badge__item--pendentes">
        <span className="stats-badge__number">{contagem.pendentes}</span>
        <span className="stats-badge__label">Pendentes</span>
      </div>
      <div className="stats-badge__item stats-badge__item--em-curso">
        <span className="stats-badge__number">{contagem.emCurso}</span>
        <span className="stats-badge__label">Em curso</span>
      </div>
      <div className="stats-badge__item stats-badge__item--concluidas">
        <span className="stats-badge__number">{contagem.concluidas}</span>
        <span className="stats-badge__label">Concluídas</span>
      </div>
    </div>
  );
};

export default StatsBadge;
