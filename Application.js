const Router = require("./Router")
const Server = require("./Server")
const Logger = require("./Logger")
const EventBus = require("./EventBus")
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
    this.eventBus = new EventBus()
    this.router = new Router(this.routes, this.routerConfig)
    this.server = new Server(this.eventBus, this.serverHandler, this.serverConfig)
    this.logger = new Logger(this.eventBus, this.loggerConfig)

    // Установить слушателей событий
    this.setListeners()
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
    const config = this.config.router || {}

    return {
      defaultHandler: context => context.ok(),
      defaultErrorHandler: context => context.error(),

      ...config
    }
  }

  /**
   * Конфигурация сервера
   * @return {Object}
   */
  get serverConfig() {
    return this.config.server || {}
  }

  /**
   * Конфигурация логгера
   * @return {Object}
   */
  get loggerConfig() {
    return this.config.logger || {}
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
   * @param {Object} headers 
   * @param {*} body 
   * @param {Object} url 
   */
  get serverHandler({ request, response, headers, body, url }) {
    /**
     * Обработчик с контекстом по умолчанию
     */
    const handler = function() {
      const method = request.methods
      const host = url.hostname
      const path = url.pathname
      const route = this.router.getRoute(method, host, path)
      const queryParams = Object.fromEntries(url.searchParams)
      const context = this.getContext({ route, request, response })
      const data = { 
        route, 
        request, 
        response,
        context,
        headers,
        params: route.params,
        queryParams,
        body,
        url
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
    /**
     * Отправить ответ
     * @param {Number} code код ответа
     * @param {*} data тело ответа
     * @param {Object} headers заголовки
     */
    const send = (code, data, headers) => {
      const routeHeaders = route.headers || {}

      // Отправить заголовки
      response.writeHead(code, { ...routeHeaders, ...headers })

      // Отправить тело
      if (data) {
        response.end(JSON.stringify(data))
      } else {
        response.end()
      }
    }

    return {
      /**
       * Положительный ответ
       * @param {*} data тело ответа
       * @param {Object} headers заголовки
       */
      ok: (data, headers) => send(Server.STATUS_OK, data, headers),

      /**
       * Ответ "ресурс не найден"
       * @param {*} data тело ответа
       * @param {Object} headers заголовки
       */
      notFound: (data, headers) => send(Server.STATUS_NOT_FOUND, data, headers),

      /**
       * Ответ "ошибка сервера" 
       * @param {*} data тело ответа
       * @param {Object} headers заголовки
       */
      error: (data, headers) => send(Server.STATUS_ERROR, data, headers),

      /**
       * Подписаться на событие из шины событий
       * @param {String} event название события
       * @param {Function} callback функция обратного вызова
       */
      on: (event, callback) => this.eventBus.on(event, callback),

      /**
       * Инициировать событие из шины событий
       * @param {String} event название события
       * @param {*} data дапнные
       */
      emit: (event, ...data) => this.eventBus.emit(event, ...data)
    }
  }

  /**
   * Установить слушателей событий
   */
  setListeners() {
    const listeners = {
      "logger:log": ({ group, title, data, level }) => this.logger.log(group, title, data, level),
      "logger:info": ({ group, title, data }) => this.logger.info(group, title, data),
      "logger:error": ({ group, title, data }) => this.logger.error(group, title, data),
    }
    
    for (const [event, callback] of Object.entries(listeners)) {
      this.eventBus.on(event, callback)
    }
  }
}

module.exports = Application
