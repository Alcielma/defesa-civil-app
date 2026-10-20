/**
 * Regex para validação básica de e-mail.
 * Verifica apenas a estrutura `usuario@dominio.tld` (não valida existência real).
 * Regra: não pode ter espaços, tem que ter @, tem que ter pelo menos um ponto depois do @.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida o formato de um endereço de e-mail.
 * Faz `.trim()` automaticamente — espaços em branco no início/fim são ignorados.
 *
 * @param email String contendo o e-mail a ser validado.
 * @returns `true` se o formato for válido, `false` caso contrário.
 *
 * @example
 * validarEmail('joao@exemplo.com'); // true
 * validarEmail('joao@.com');        // false
 * validarEmail('joao sem arroba');  // false
 */
export const validarEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Valida se uma senha atende ao comprimento mínimo.
 * Valida também se o tipo é string (evita erros em valores `null/undefined`).
 *
 * @param senha   Senha do usuário.
 * @param min     Tamanho MÍNIMO aceito (default: 6).
 * @returns `true` se a senha é string com comprimento >= min.
 *
 * @example
 * validarSenha('123456');       // true (default min = 6)
 * validarSenha('123');          // false
 * validarSenha('Abc123!', 8);   // false (min definido como 8)
 */
export const validarSenha = (senha: string, min = 6): boolean => {
  return typeof senha === 'string' && senha.length >= min;
};

/**
 * Valida um CPF brasileiro (11 dígitos) usando o ALGORITMO OFICIAL dos dois dígitos verificadores.
 *
 * Características:
 * - Remove máscaras (pontos, traços, parênteses) automaticamente
 * - Rejeita CPFs com todos os dígitos iguais (ex: "111.111.111-11")
 * - Calcula o primeiro dígito verificador (10º dígito) e valida
 * - Calcula o segundo dígito verificador (11º dígito) e valida
 *
 * @param cpf CPF com ou sem máscara.
 * @returns `true` se for um CPF válido matematicamente.
 *
 * @example
 * validarCpf('529.982.247-25'); // true
 * validarCpf('52998224725');    // true (sem máscara)
 * validarCpf('111.111.111-11'); // false (dígitos repetidos)
 * validarCpf('123');            // false
 */
export const validarCpf = (cpf: string): boolean => {
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11 || /^(\d)\1+$/.test(limpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(limpo[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(limpo[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(limpo[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === Number(limpo[10]);
};

/**
 * Valida se um campo de formulário NÃO está vazio.
 * Suporta múltiplos tipos:
 * - `string`     : com `trim()` — rejeita strings só com espaços
 * - `Array`      : verifica se tem pelo menos 1 elemento
 * - `null/undefined` : sempre inválido
 * - outros valores (number, boolean, object) : sempre válidos (true/false/0 etc contam como valor)
 *
 * Usado em campos obrigatórios genéricos (selects, inputs textarea, arquivos, etc).
 *
 * @param valor Valor de qualquer tipo vindo do formulário.
 * @returns `true` se o campo tiver conteúdo válido.
 *
 * @example
 * campoObrigatorio('');           // false
 * campoObrigatorio('   ');        // false
 * campoObrigatorio('João');       // true
 * campoObrigatorio([]);           // false
 * campoObrigatorio(['a']);        // true
 * campoObrigatorio(null);         // false
 */
export const campoObrigatorio = (valor: unknown): boolean => {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === 'string') return valor.trim().length > 0;
  if (Array.isArray(valor)) return valor.length > 0;
  return true;
};

/**
 * Valida um número de telefone brasileiro (fixo OU celular).
 * Remove máscaras e aceita apenas strings com 10 dígitos (fixo: XX + 8)
 * ou 11 dígitos (celular: XX + 9 + 8).
 *
 * @param tel Telefone com ou sem máscara (parênteses, espaço, traço, etc).
 * @returns `true` se a quantidade de dígitos for 10 ou 11.
 *
 * @example
 * validarTelefone('(87) 1234-5678');  // true  (fixo, 10 dígitos)
 * validarTelefone('(87) 91234-5678'); // true  (celular, 11 dígitos)
 * validarTelefone('1234');            // false
 */
export const validarTelefone = (tel: string): boolean => {
  const limpo = tel.replace(/\D/g, '');
  return limpo.length >= 10 && limpo.length <= 11;
};
