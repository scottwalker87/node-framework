/**
 * Контекст приложения
 */
class Context {
  /**
   * Инициализировать контекст
   * @param {Object} container контейнер зависимостей
   */
  constructor(container, request, response, route) {
    this.container = container
    this.request = request
    this.response = response
    this.route = route
  }

  /**
   * ID моудля
   * @return {Object}
   */
  get moduleId() {
    return this.route.moduleId || "unknown"
  }

  /**
   * Параметры маршрута (полученные вследствие парсинга маршрута роутером)
   * @return {Object}
   */
  get params() {
    const queryParams = this.request.queryParams || {}
    const routeParams = this.route.params || {}

    return { ...routeParams, ...queryParams }
  }
}

module.exports = Context
