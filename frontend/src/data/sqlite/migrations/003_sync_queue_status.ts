import { Migration } from './001_initial';

/**
 * Controle de tentativas da fila de sincronia:
 * - `status`: `pendente` (será reenviado) ou `erro` (o servidor recusou de
 *   forma definitiva, ex: 422 — não adianta reenviar sem corrigir os dados).
 * - `nextAttemptAt`: só tenta de novo a partir deste instante (espera
 *   crescente entre falhas, para não martelar o servidor).
 */
export const migration003SyncQueueStatus: Migration = {
  version: 3,
  statements: [
    `ALTER TABLE sync_queue ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente';`,
    `ALTER TABLE sync_queue ADD COLUMN nextAttemptAt INTEGER NOT NULL DEFAULT 0;`,
    `CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue (status, nextAttemptAt);`,
  ],
};
