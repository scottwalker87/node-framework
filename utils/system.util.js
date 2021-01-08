const { inspect } = require("util")

/**
 * Глубокое логирование
 * @param {*} data данные 
 * @param {Boolean} showHidden показывать скрытые свойства 
 */
const deepLog = (data, showHidden = false) => {
  console.log(inspect(data, showHidden, Infinity, true))
}

module.exports = { deepLog }
