/**
 * Обработчик hello
 * @param {Object} context 
 */
module.exports = async ({ container, response, routeParams: { name } }) => {
  const user = container.make("base/models/User", { name })

  response.ok({ message: `Hello, ${user.name}!`})
}
