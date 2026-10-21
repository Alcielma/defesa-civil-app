import { App } from '@capacitor/app';
import { networkAdapter } from './network';
import { syncEngine } from './syncEngine';

const INTERVALO_PADRAO_MS = 2 * 60_000;

/**
 * Liga os gatilhos que processam a fila offline sozinhos:
 * - agora (ao entrar no app já logado);
 * - quando a internet volta;
 * - quando o app volta do segundo plano;
 * - a cada `intervaloMs`, para reenviar itens que estavam esperando.
 *
 * Retorna a função que desliga todos os gatilhos (usar no logout).
 */
export const iniciarSincronizacaoAutomatica = (
  intervaloMs = INTERVALO_PADRAO_MS
): (() => void) => {
  syncEngine.sincronizarEmBreve(0);

  const cancelarRede = networkAdapter.subscribe((status) => {
    if (status === 'online') syncEngine.sincronizarEmBreve();
  });

  const listenerApp = App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) syncEngine.sincronizarEmBreve();
  }).catch(() => null);

  const intervalo = setInterval(() => syncEngine.sincronizarEmBreve(0), intervaloMs);

  return () => {
    cancelarRede();
    clearInterval(intervalo);
    void listenerApp.then((h) => h?.remove());
  };
};
