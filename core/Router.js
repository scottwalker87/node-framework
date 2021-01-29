const { URL } = require("url")

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
   * Опции по умолчанию
   * @return {Object}
   */
  get defaultOptions() {
    return this.config.options || {}
  }

  /**
   * Заголовки по умолчанию
   * @return {Object}
   */
  get defaultHeaders() {
    return this.config.headers || {}
  }

  /**
   * Обработчик по умолчанию
   * @return {Function}
   */
  get defaultHandler() {
    return this.config.handler || (() => {})
  }

  /**
   * Обработчик ошибки по умолчанию
   * @return {Function}
   */
  get defaultErrorHandler() {
    return this.config.errorHandler || (() => {})
  }

  /**
   * Получить маршрут
   * @param {String} method 
   * @param {URL} url 
   * @return {Object}
   */
  getRoute(method, url) {
    const isCorrectUrl = url instanceof URL

    // Проверить URL на корректность
    if (!isCorrectUrl) {
      throw "Передан некорректный URL"
    }

    // Нормализовать метод
    method = String(method).toUpperCase()

    // Получить запрашиваемый путь
    const path = String(url.pathname).toLowerCase()

    // Найти первый подходящий маршрут
    const route = this.findRoute(method, path)

    // Если маршрут найден
    if (route) {
      // Получить параметры маршрута
      const params = this.getPathParams(path, route.path)

      // Вернуть маршрут
      return this.normalizeRoute({ ...route, method, path, params, url })
    }

    // Вернуть маршрут по умолчанию
    return this.normalizeRoute({ method, path, url })
  }

  /**
   * Найти маршрут
   * @param {String} method метод запроса 
   * @param {String} path путь запроса
   * @return {Object|undefined}
   */
  findRoute(method, path) {
    /**
     * Сопоставить метод
     * @return {Boolean}
     */
    const matchMethod = routeMethod => { 
      /**
       * Сравнить метод с запрашиваемым методом
       * @param {String} comparedMethod 
       * @return {Boolean}
       */
      const compare = comparedMethod => String(comparedMethod).toUpperCase() === method
        
      // Если задан массив доступных методов
      if (routeMethod instanceof Array) {
        return routeMethod.some(compare)
      } else {
        return compare(routeMethod)
      }
    }

    /**
     * Сопоставить путь
     * @return {Boolean}
     */
    const matchPath = routePath => new RegExp(`^${routePath}$`).test(path)

    // Найти маршрут по совпадениям метода запроса и его пути
    return this.routes.find(route => matchMethod(route.method) && matchPath(route.path))
  }

  /**
   * Нормализовать маршрут
   * @param {Object} route 
   * @return {Object}
   */
  normalizeRoute(route) {
    const options = route.options || this.defaultOptions
    const headers = route.headers || this.defaultHeaders
    const handler = route.handler || this.defaultHandler
    const errorHandler = route.errorHandler || this.defaultErrorHandler
    const method = route.method || ""
    const path = route.path || ""
    const params = route.params || {}
    const url = route.url || {}

    return { ...route, options, headers, method, path, params, url, handler, errorHandler }
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
