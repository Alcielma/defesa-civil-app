// Copia o sql-wasm.wasm da versão exata de `sql.js` fixada no package.json
// para public/assets/. O jeep-sqlite (usado para SQLite no navegador) traz
// embutido o JS "glue" do sql.js já compilado, mas não o binário .wasm — ele
// tem que ser fornecido pelo app, e precisa ser EXATAMENTE da mesma versão
// de sql.js que o jeep-sqlite empacotou (senão o wasm falha ao instanciar
// com um erro de import incompatível). Por isso `sql.js` é fixado em versão
// exata nas dependências e este script roda em todo `npm install`
// (postinstall), evitando que o arquivo fique desatualizado.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raizProjeto = dirname(dirname(fileURLToPath(import.meta.url)));
const origem = join(raizProjeto, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const pastaDestino = join(raizProjeto, 'public', 'assets');
const destino = join(pastaDestino, 'sql-wasm.wasm');

if (!existsSync(origem)) {
  console.warn(`[copy-sqlite-wasm] ${origem} não encontrado — pulando cópia.`);
  process.exit(0);
}

mkdirSync(pastaDestino, { recursive: true });
copyFileSync(origem, destino);
console.log(`[copy-sqlite-wasm] sql-wasm.wasm (sql.js) copiado para ${destino}`);
