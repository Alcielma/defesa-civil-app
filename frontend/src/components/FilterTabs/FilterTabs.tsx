import { StatusVistoria } from '../../domain/entities';
import { FiltroStatus } from '../../domain/useCases';
import './FilterTabs.css';

export interface FilterTabsProps {
  filtroAtivo: FiltroStatus;
  onChange: (filtro: FiltroStatus) => void;
}

const OPCOES: { valor: FiltroStatus; label: string }[] = [
  { valor: 'TODOS', label: 'Todos' },
  { valor: StatusVistoria.PENDENTE, label: 'Pendentes' },
  { valor: StatusVistoria.EM_CURSO, label: 'Em curso' },
  { valor: StatusVistoria.CONCLUIDA, label: 'Concluídas' },
];

const FilterTabs = ({ filtroAtivo, onChange }: FilterTabsProps) => {
  return (
    <div className="filter-tabs" role="tablist">
      {OPCOES.map((opcao) => {
        const ativo = filtroAtivo === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            role="tab"
            aria-selected={ativo}
            className={`filter-tabs__item ${ativo ? 'filter-tabs__item--active' : ''}`}
            onClick={() => onChange(opcao.valor)}
          >
            {opcao.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
