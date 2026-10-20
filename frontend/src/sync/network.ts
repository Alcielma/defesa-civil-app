import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export type NetworkStatus = 'online' | 'offline';

export interface NetworkListener {
  (status: NetworkStatus): void;
}

const isCapacitorNative = (): boolean =>
  typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();

export const networkAdapter = {
  isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    if (isCapacitorNative()) return navigator.onLine;
    return navigator.onLine;
  },

  status(): NetworkStatus {
    return this.isOnline() ? 'online' : 'offline';
  },

  async refreshStatus(): Promise<NetworkStatus> {
    if (isCapacitorNative()) {
      try {
        const s = await Network.getStatus();
        return s.connected ? 'online' : 'offline';
      } catch {
        return this.status();
      }
    }
    return this.status();
  },

  subscribe(listener: NetworkListener): () => void {
    const onChange = () => listener(this.status());

    if (isCapacitorNative()) {
      try {
        const handlerPromise = Network.addListener('networkStatusChange', (s) =>
          listener(s.connected ? 'online' : 'offline')
        );
        if (typeof window !== 'undefined') {
          window.addEventListener('online', onChange);
          window.addEventListener('offline', onChange);
        }
        return () => {
          try {
            handlerPromise.then((h) => h.remove());
          } catch {
            /* ignore */
          }
          if (typeof window !== 'undefined') {
            window.removeEventListener('online', onChange);
            window.removeEventListener('offline', onChange);
          }
        };
      } catch {
        /* fallback a eventos de window abaixo */
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', onChange);
      window.addEventListener('offline', onChange);
      return () => {
        window.removeEventListener('online', onChange);
        window.removeEventListener('offline', onChange);
      };
    }
    return () => undefined;
  },
};
