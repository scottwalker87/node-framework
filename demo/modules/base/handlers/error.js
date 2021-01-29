/**
 * Обработчик ошибок в базовом модуле
 * @param {Object} context 
 */
module.exports = ({ error }) => {
  error({ message: "Error of base module" })
}
