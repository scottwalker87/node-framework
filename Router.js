/**
 * Роутер
 */
class Router {
  /**
   * Инициализировать роутер
   * @param {Array} routes 
   * @param {Object} config 
   */
  constructor(routes, config) {
    this.routes = routes || []
    this.config = config || {}
  }

  /**
   * Заголовки по умолчанию
   * @return {Object}
   */
  get defaultHeaders() {
    return this.config.defaultHeaders || {}
  }

  /**
   * Обработчик по умолчанию
   * @return {Function}
   */
  get defaultHandler() {
    return this.config.defaultHandler || (() => {})
  }

  /**
   * Обработчик ошибки по умолчанию
   * @return {Function}
   */
  get defaultErrorHandler() {
    return this.config.defaultErrorHandler || (() => {})
  }

  /**
   * Получить маршрут
   * @param {String} method 
   * @param {String} path 
   */
  getRoute(method, path) {
    method = String(method).toUpperCase()

    // Найти первый подходящий маршрут
    const route = this.routes.find(route => {
      /**
       * Сопоставить метод
       * @return {Boolean}
       */
      const matchMethod = () => String(route.method).toUpperCase() === method

      /**
       * Сопоставить путь
       * @return {Boolean}
       */
      const matchPath = () => new RegExp(`^${route.path}$`).test(path)

      // Если совпадают и метод и путь
      return matchMethod() && matchPath()
    })

    // Если маршрут найден
    if (route) {
      return this.normalizeRoute(route)
    }

    // Вернуть маршрут по умолчанию
    return this.normalizeRoute({ method, path })
  }

  /**
   * Нормализовать маршрут
   * @param {Object} route 
   */
  normalizeRoute(route) {
    const headers = route.headers || this.defaultHeaders
    const handler = route.handler || this.defaultHandler
    const errorHandler = route.errorHandler || this.defaultErrorHandler

    return { ...route, headers, handler, errorHandler }
  }
}

module.exports = Router
