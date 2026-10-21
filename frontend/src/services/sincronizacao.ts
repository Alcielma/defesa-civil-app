import { iniciarSincronizacaoAutomatica, syncEngine } from '../sync';
import { FORMULARIOS_ENTITY, sincronizarItemFormulario } from './FormularioService';
import { sincronizarItemVistoria, VISTORIAS_ENTITY } from './VistoriaService';

/**
 * Registra quem envia cada entidade da fila offline e liga os gatilhos
 * automáticos. Para incluir uma entidade nova, basta registrar o handler dela aqui.
 *
 * Retorna a função que desliga a sincronização automática (usar no logout).
 */
export const iniciarSincronizacao = (): (() => void) => {
  syncEngine.registrar(VISTORIAS_ENTITY, sincronizarItemVistoria);
  syncEngine.registrar(FORMULARIOS_ENTITY, sincronizarItemFormulario);
  return iniciarSincronizacaoAutomatica();
};
