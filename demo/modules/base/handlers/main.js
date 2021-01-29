/**
 * Обработчик корневого маршрута
 * @param {Object} context 
 */
module.exports = ({ ok }) => {
  ok({ message: "Hello from base module" })
}
