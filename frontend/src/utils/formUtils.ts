import { OpcaoFormulario } from '@/domain/entities';

/**
 * Converte valores selecionados (strings ou arrays) em rótulos amigáveis para exibição.
 * Substitui automaticamente opções de "Outro" pela especificação digitada, se existir.
 */
export const getLabels = (
  selecionados: string[] | string | undefined,
  opcoes: (OpcaoFormulario | string)[],
  especificacao?: string
): string => {
  const lista = Array.isArray(selecionados) ? selecionados : selecionados ? [selecionados] : [];
  if (lista.length === 0) return 'Nenhum selecionado';

  const labels = lista.map(val => {
    const opcao = opcoes.find(opt => {
      if (typeof opt === 'string') return opt === val;
      return opt.valor === val;
    });
    
    const label = typeof opcao === 'string' ? opcao : (opcao?.rotulo || val);
    
    // Se for uma opção de "Outro" e tiver especificação
    if (label.toLowerCase().includes('outro') && especificacao) {
      return especificacao;
    }
    
    return label;
  });

  // Remove duplicatas e junta com vírgula
  return Array.from(new Set(labels)).join(', ');
};
