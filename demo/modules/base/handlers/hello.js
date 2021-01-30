/**
 * Обработчик hello
 * @param {Object} context 
 */
module.exports = ({ ok, routeParams }) => {
  const { name } = routeParams
  
  ok({ message: `Hello ${name}` })
}
