export enum StatusVistoria {
  PENDENTE = 'PENDENTE',
  EM_CURSO = 'EM_CURSO',
  CONCLUIDA = 'CONCLUIDA',
}

export interface Vistoria {
  id: string;
  nomeSolicitante: string;
  endereco: string;
  protocolo: string;
  status: StatusVistoria;
  dataCriacao: Date;
  agenteResponsavelId?: string;
}

export interface ContagemVistorias {
  pendentes: number;
  emCurso: number;
  concluidas: number;
  total: number;
}
