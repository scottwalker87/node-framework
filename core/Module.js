/**
 * Модуль приложения
 */
class Module {
  /**
   * Инициализировать запрос к приложению 
   * @param {String} id ID модуля
   * @param {Object} assets ресурсы модуля
   */
  constructor(id, { routes, dependencies }) {
    if (!id) {
      throw "Необходимо указать id модуля"
    }

    this.id = id
    this.routes = routes || []
    this.dependencies = dependencies || []
  }
}

module.exports = Module
