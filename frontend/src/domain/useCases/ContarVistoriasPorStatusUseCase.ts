import { ContagemVistorias, StatusVistoria, Vistoria } from '../entities';

/** Totais por status, usados nos contadores do topo da Home. */
export const contarVistoriasPorStatus = (lista: Vistoria[]): ContagemVistorias =>
  lista.reduce<ContagemVistorias>(
    (acc, v) => {
      if (v.status === StatusVistoria.PENDENTE) acc.pendentes++;
      else if (v.status === StatusVistoria.EM_CURSO) acc.emCurso++;
      else if (v.status === StatusVistoria.CONCLUIDA) acc.concluidas++;
      acc.total++;
      return acc;
    },
    { pendentes: 0, emCurso: 0, concluidas: 0, total: 0 }
  );
