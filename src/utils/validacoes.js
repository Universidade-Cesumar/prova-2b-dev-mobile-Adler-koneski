/**
 * Função pura que valida se uma retirada de estoque é permitida.
 * @param {number} estoqueAtual - Quantidade atual em estoque
 * @param {number} quantidadeRetirada - Quantidade a ser retirada
 * @returns {boolean} true se a operação for válida, false caso contrário
 */
export function validarRetirada(estoqueAtual, quantidadeRetirada) {
  if (typeof estoqueAtual !== 'number' || typeof quantidadeRetirada !== 'number') {
    return false;
  }
  if (estoqueAtual < 0 || quantidadeRetirada <= 0) {
    return false;
  }
  if (quantidadeRetirada > estoqueAtual) {
    return false;
  }
  return true;
}