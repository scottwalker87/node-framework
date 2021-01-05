const Router = require("./Router")
const Server = require("./Server")
const modules = require("./modules")

/**
 * Приложение
 */
class Application {
  /**+
   * Инициализировать приложение
   * @param {Object} config 
   */
  constructor(config) {
    this.config = config || {}
    this.router = new Router(this.routes, this.routerConfig)
    this.server = new Server(this.serverHandler, this.serverConfig)
  }

  /**
   * Запустить приложение
   */
  run() {
    this.server.start()
  }

  /**
   * Конфигурация роутера
   * @return {Object}
   */
  get routerConfig() {
    return this.config.router || {}
  }

  /**
   * Конфигурация сервера
   * @return {Object}
   */
  get serverConfig() {
    return this.config.server || {}
  }

  /**
   * Маршруты приложения
   * @return {Array}
   */
  get routes() {
    return modules.reduce((routes, item) => {
      const itemRoutes = item.routes || {}

      return { ...routes, ...itemRoutes }
    }, [])
  }

  /**
   * Обработчик запросов
   * @param {Object} request 
   * @param {Object} response 
   * @param {Object} body 
   */
  get serverHandler({ request, response, body }) {
    /**
     * Обработчик с контекстом по умолчанию
     */
    const handler = function() {
      const { method, path } = request
      const route = this.router.getRoute(method, path)
      const context = this.getContext({ route, request, response })
      const data = { 
        method, 
        path, 
        route, 
        request, 
        response,
        context,
        body 
      }
  
      try {
        route.handler(data)
      } catch {
        route.errorHandler(data)
      }
    }

    // Привязать контекст приложения к обработчику
    return handler.bind(this)
  }

  /**
   * Получить контекст для обработчика 
   * @param {Object} { route, request, response } 
   * @return {Object}
   */
  getContext({ route, request, response }) {
    const STATUS_OK = 200
    const STATUS_NOT_FOUND = 404
    const STATUS_ERROR = 500

    /**
     * Отправить ответ
     * @param {Number} code код ответа
     * @param {*} data тело ответа
     * @param {Object} headers заголовки
     */
    const send = (code, data, headers) => {
      const routeHeaders = route.headers || {}

      response.writeHead(code, { ...routeHeaders, ...headers })
      response.end(JSON.stringify(data))
    }

    return {
      /**
       * Положительный ответ
       * @param {*} data тело ответа
       * @param {Object} headers заголовки
       */
      ok: (data, headers) => send(STATUS_OK, data, headers),

      /**
       * Ответ "ресурс не найден"
       * @param {*} data тело ответа
       * @param {Object} headers заголовки
       */
      notFound: (data, headers) => send(STATUS_NOT_FOUND, data, headers),

      /**
       * Ответ "ошибка сервера" 
       * @param {*} data тело ответа
       * @param {Object} headers заголовки
       */
      error: (data, headers) => send(STATUS_ERROR, data, headers)
    }
  }
}

module.exports = Application
