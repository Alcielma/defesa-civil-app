import { Vistoria, StatusVistoria } from '../entities';

export type FiltroStatus = 'TODOS' | StatusVistoria;

export const filtrarVistoriasPorStatus = (vistorias: Vistoria[], filtro: FiltroStatus): Vistoria[] => {
  if (filtro === 'TODOS') {
    return [...vistorias];
  }
  return vistorias.filter((v) => v.status === filtro);
};
