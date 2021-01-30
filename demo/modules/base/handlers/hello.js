const User = require("../models/User")

/**
 * Обработчик hello
 * @param {Object} context 
 */
module.exports = ({ ok, routeParams: { name } }) => {
  const user = new User(name)

  ok({ message: `Hello ${user.name}`})
}
