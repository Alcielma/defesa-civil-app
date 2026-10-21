export const toggleOpcao = (lista: string[], valor: string): string[] => {
  if (lista.includes(valor)) {
    return lista.filter((v) => v !== valor);
  }
  return [...lista, valor];
};
