const { Module } = require("@scottwalker/node-framework")

/**
 * Базовый модуль
 */
module.exports = new Module("base", {
  routes: require("./routes"),
  dependencies: require("./dependencies")
})
