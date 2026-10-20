/**
 * Formata uma data para o padrão brasileiro curto (apenas data).
 * Usa `toLocaleDateString('pt-BR')` nativo — respeita fuso local.
 *
 * @param data Pode ser objeto `Date` ou uma `string` reconhecível pelo construtor Date.
 * @returns String no formato `DD/MM/AAAA`.
 *
 * @example
 * formatarData(new Date(2026, 0, 15));     // "15/01/2026"
 * formatarData('2026-01-15T10:30:00Z');    // "15/01/2026"
 */
export const formatarData = (data: Date | string): string => {
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formata data e hora para o padrão brasileiro longo.
 *
 * @param data Pode ser objeto `Date` ou `string` ISO.
 * @returns String no formato `DD/MM/AAAA HH:MM` (24h).
 *
 * @example
 * formatarDataHora('2026-01-15T14:35:00Z'); // "15/01/2026 14:35"
 */
export const formatarDataHora = (data: Date | string): string => {
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Aplica a máscara de CPF: `000.000.000-00`.
 * Remove caracteres não numéricos automaticamente e limita em 14 caracteres.
 *
 * @param cpf CPF com ou sem máscara (parcial ou completo).
 * @returns CPF formatado (ex: "529.982.247-25").
 *
 * @example
 * formatarCpf('52998224725');       // "529.982.247-25"
 * formatarCpf('529.982');           // "529.982"
 */
export const formatarCpf = (cpf: string): string => {
  return cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

/**
 * Aplica a máscara de telefone brasileiro.
 * Detecta automaticamente entre fixo (10 dígitos: `(00) 0000-0000`)
 * e celular (11 dígitos: `(00) 00000-0000`).
 *
 * Remove caracteres não numéricos automaticamente.
 *
 * @param tel Telefone com ou sem máscara.
 * @returns Telefone formatado com DDD e hífen.
 *
 * @example
 * formatarTelefone('8712345678');   // "(87) 1234-5678"   (fixo)
 * formatarTelefone('87912345678');  // "(87) 91234-5678"  (celular)
 */
export const formatarTelefone = (tel: string): string => {
  const d = tel.replace(/\D/g, '');
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

/**
 * Formata um número para moeda brasileira (Real — BRL).
 * Usa `toLocaleString` com estilo de moeda — inclui símbolo R$ e formata decimais.
 *
 * @param valor Valor numérico (em Reais).
 * @returns String formatada com símbolo R$ e vírgula decimal.
 *
 * @example
 * formatarMoeda(19.9);          // "R$ 19,90"
 * formatarMoeda(12345.67);      // "R$ 12.345,67"
 */
export const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 * Converte tamanho de arquivo em BYTES para a unidade mais legível apropriada.
 * Escalas suportadas: B, KB, MB, GB (1024 bytes = 1 KB — padrão binário).
 *
 * @param bytes Tamanho em bytes (inteiro não negativo).
 * @returns String no formato "<valor> <unidade>" com 2 casas decimais.
 *
 * @example
 * formatarTamanhoArquivo(0);          // "0 B"
 * formatarTamanhoArquivo(1024);       // "1 KB"
 * formatarTamanhoArquivo(5242880);    // "5 MB"
 * formatarTamanhoArquivo(1234567890); // "1.15 GB"
 */
export const formatarTamanhoArquivo = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const tamanhos = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${tamanhos[i]}`;
};
