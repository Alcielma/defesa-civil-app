export enum StatusVistoria {
  PENDENTE = 'PENDENTE',
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
  concluidas: number;
  total: number;
}
