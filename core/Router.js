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
    return this.config.handler || (({ response }) => response.ok())
  }

  /**
   * Обработчик ошибки по умолчанию
   * @return {Function}
   */
  get defaultErrorHandler() {
    return this.config.errorHandler || (({ response }) => response.error())
  }

  /**
   * Нормализовать путь
   * @param {String} path 
   * @return {String}
   */
  normalizePath(path) {
    return path.startsWith("/") ? path : `/${path}`
  }

  /**
   * Сделать регулярное выражение
   * @param {String} path 
   * @return {RegExp}
   */
  makePathExpression(path) {
    return new RegExp(`^${this.normalizePath(path)}$`)
  }

  /**
   * Получить маршрут
   * @param {Object} request 
   * @return {Object}
   */
  getRoute(request) {
    // Нормализовать метод
    const method = request.method.toUpperCase()
    
    // Получить запрашиваемый путь
    const path = this.normalizePath(request.path).toLowerCase()

    // Найти первый подходящий маршрут
    const route = this.findRoute(method, path)

    // Если маршрут найден
    if (route) {
      // Получить параметры маршрута
      const params = this.getRouteParams(path, route.path)

      // Вернуть маршрут
      return this.normalizeRoute({ ...route, method, path, params })
    }

    // Вернуть маршрут по умолчанию
    return this.normalizeRoute({ method, path })
  }

  /**
   * Найти маршрут
   * @param {String} method метод запроса 
   * @param {String} path путь запроса
   * @return {Object|undefined}
   */
  findRoute(method, path) {
    /**
     * Сравнить метод с запрашиваемым методом
     * @param {String} comparedMethod 
     * @return {Boolean}
     */
    const compare = comparedMethod => String(comparedMethod).toUpperCase() === method

    /**
     * Сопоставить метод
     * @return {Boolean}
     */
    const matchMethod = routeMethod => { 
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
    const matchPath = routePath => this.makePathExpression(routePath).test(path)

    // Найти маршрут по совпадениям метода запроса и его пути
    return this.routes.find(route => matchMethod(route.method) && matchPath(route.path))
  }

  /**
   * Нормализовать маршрут
   * @param {Object} route 
   * @return {Object}
   */
  normalizeRoute(route) {
    const options = { ...this.defaultOptions, ...(route.options || {}) }
    const headers = { ...this.defaultHeaders, ...(route.headers || {}) }
    const handler = route.handler || this.defaultHandler
    const errorHandler = route.errorHandler || this.defaultErrorHandler
    const method = route.method || ""
    const path = route.path || ""
    const params = route.params || {}
    const id = `${method}.${path}`
    
    return { ...route, options, headers, handler, errorHandler, method, path, params, id }
  }

  /**
   * Получить параметры из пути
   * @param {String} path 
   * @param {String} pattern 
   * @return {Object}
   */
  getRouteParams(path, pattern) {
    const { groups, index, input, ...matches } = path.match(this.makePathExpression(pattern))
    const params = groups || {}
    const indexedParams = Object.values(matches)

    indexedParams.shift()

    return { ...params, ...indexedParams }
  }
}

module.exports = Router
