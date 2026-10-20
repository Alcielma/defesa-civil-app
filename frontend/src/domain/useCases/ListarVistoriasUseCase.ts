import { Vistoria, ContagemVistorias } from '../entities';
import { IVistoriaService } from '../../services/VistoriaService';

export class ListarVistoriasUseCase {
  constructor(private readonly vistoriaService: IVistoriaService) {}

  async executar(agenteId?: string): Promise<Vistoria[]> {
    if (agenteId) {
      return this.vistoriaService.listarPorAgente(agenteId);
    }
    return this.vistoriaService.listarTodas();
  }

  async contar(agenteId?: string): Promise<ContagemVistorias> {
    return this.vistoriaService.contar(agenteId);
  }
}
