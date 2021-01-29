const Router = require("./Router")
const Server = require("./Server")
const Logger = require("./Logger")
const EventBus = require("./EventBus")
const Context = require("./Context")

/**
 * Приложение
 */
class Application {
  // Группы логирования
  static LOGGER_GROUP_SERVER = "server"

  /**
   * Инициализировать приложение
   * @param {Array} modules 
   * @param {Object} config 
   */
  constructor(modules, config) {
    this.config = config || {}
    this.modules = modules || []
    this.eventBus = new EventBus()
    this.router = new Router(this.routes, this.routerConfig)
    this.server = new Server(this.eventBus, this.serverHandler.bind(this), this.serverConfig)
    this.context = new Context(this.eventBus)
    this.logger = new Logger(this.loggerConfig)

    // Установить слушателей событий
    this.setListeners()
  }

  /**
   * Запустить приложение
   * @return {Promise}
   */
  run() {
    return new Promise(async resolve => {
      await this.server.start()

      resolve()
    })
  }

  /**
   * Убить приложение
   * @return {Promise}
   */
  kill() {
    return new Promise(async resolve => {
      await this.server.stop()

      resolve()
    })
  }

  /**
   * Конфигурация роутера
   * @return {Object}
   */
  get routerConfig() {
    const config = this.config.router || {}

    return {
      handler: ({ ok }) => ok(),
      errorHandler: ({ error }) => error(),

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
    const routes = []

    // Обойти модули
    this.modules.forEach(item => {

      // Обойти маршруты
      item.routes.forEach(route => {
        routes.push({ ...route,  moduleId: item.id })
      })
    })

    return routes
  }

  /**
   * Обработчик запросов
   * @param {Object} request 
   * @param {Object} response 
   * @param {String} method 
   * @param {Object} url 
   * @param {Object} headers 
   * @param {*} body 
   */
  serverHandler({ request, response, method, url, headers, body }) {
    const route = this.router.getRoute(method, url)
    const context = this.context.create({ 
      route,
      request, 
      response, 
      headers,
      body
    })

    try {
      // Обработать успешный запрос
      route.handler(context)
    } catch {
      // Обработать запрос с ошибкой
      route.errorHandler(context)
    }
  }

  /**
   * Установить слушателей событий
   */
  setListeners() {
    // Слушать события логирования
    this.eventBus.on("log:info", params => this.log({ ...params, level: Logger.LEVEL_INFO }))
    this.eventBus.on("log:error", params => this.log({ ...params, level: Logger.LEVEL_ERROR }))
  }

  /**
   * Логировать
   * @param {Object} params 
   */
  log({ group, level, title, data }) {
    group = group || Logger.DEFAULT_GROUP
    level = level || Logger.LEVEL_INFO
    title = title || ""
    data = data || {}

    this.logger.log(group, title, data, level)
  }
}

module.exports = Application
