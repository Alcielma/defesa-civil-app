import { Vistoria } from '../entities';

export const buscarVistorias = (vistorias: Vistoria[], termo: string): Vistoria[] => {
  if (!termo.trim()) return [...vistorias];
  const termoNormalizado = termo.trim().toLowerCase();
  return vistorias.filter(
    (v) =>
      v.nomeSolicitante.toLowerCase().includes(termoNormalizado) ||
      v.protocolo.toLowerCase().includes(termoNormalizado) ||
      v.endereco.toLowerCase().includes(termoNormalizado)
  );
};
