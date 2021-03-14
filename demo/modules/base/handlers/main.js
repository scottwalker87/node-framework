/**
 * Обработчик корневого маршрута
 * @param {Object} context 
 */
module.exports = async ({ response }) => {
  response.ok({ message: "Hello from base module" })
}
