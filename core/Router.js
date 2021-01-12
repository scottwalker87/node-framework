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
   * @param {String} host 
   * @param {String} path 
   * @return {Object}
   */
  getRoute(method, host, path) {
    method = String(method).toUpperCase()
    host = String(host).toLowerCase()
    path = String(path).toLowerCase()

    // Найти первый подходящий маршрут
    const route = this.routes.find(route => {
      /**
       * Сопоставить метод
       * @return {Boolean}
       */
      const matchMethod = () => { 
        const compare = comparedMethod => String(comparedMethod).toUpperCase() === method

        // Если задан массив доступных методов
        if (route.method instanceof Array) {
          return route.method.some(compare)
        } else {
          return compare(route.method)
        }
      }

        /**
       * Сопоставить хост
       * @return {Boolean}
       */
      const matchHost = () => !route.host || String(route.host).toLowerCase() === host

      /**
       * Сопоставить путь
       * @return {Boolean}
       */
      const matchPath = () => new RegExp(`^${route.path}$`).test(path)

      // Если совпадают и метод и путь
      return matchMethod() && matchHost() && matchPath()
    })

    // Если маршрут найден
    if (route) {
      const params = this.getPathParams(path, route.path)

      // Вернуть маршрут
      return this.normalizeRoute({ ...route, method, host, path, params })
    }

    // Вернуть маршрут по умолчанию
    return this.normalizeRoute({ method, host, path })
  }

  /**
   * Нормализовать маршрут
   * @param {Object} route 
   * @return {Object}
   */
  normalizeRoute(route) {
    const headers = route.headers || this.defaultHeaders
    const handler = route.handler || this.defaultHandler
    const errorHandler = route.errorHandler || this.defaultErrorHandler
    const method = route.method || ""
    const host = route.host || ""
    const path = route.path || ""
    const params = route.params || {}

    return { ...route, headers, method, host, path, params, handler, errorHandler }
  }

  /**
   * Получить параметры из пути
   * @param {String} path 
   * @param {String} pattern 
   * @return {Object}
   */
  getPathParams(path, pattern) {
    const { groups, index, input, ...matches } = path.match(new RegExp(`^${pattern}$`))
    const params = groups || {}
    const indexedParams = Object.values(matches)

    indexedParams.shift()

    return { ...params, ...indexedParams }
  }
}

module.exports = Router
