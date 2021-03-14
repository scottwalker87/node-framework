/**
 * Обработчик ошибок в базовом модуле
 * @param {Object} context 
 */
module.exports = async ({ response }) => {
  response.error({ message: "Error of base module" })
}
