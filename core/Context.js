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
   * URL маршрута
   * @return {Object}
   */
  get url() {
    return this.route.url || {}
  }

  /**
   * GET параметры запроса
   * @return {Object}
   */
  get queryParams() {
    return this.url.searchParams ? Object.fromEntries(this.url.searchParams) : {}
  }

  /**
   * Параметры маршрута (полученные вследствие парсинга маршрута роутером)
   * @return {Object}
   */
  get routeParams() {
    return this.route.params || {}
  }
}

module.exports = Context
