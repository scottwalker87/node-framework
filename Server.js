const http = require("http")
const https = require("https")

/**
 * Сервер
 */
class Server {
  // Порт по умолчанию
  static DEFAULT_PORT = 3000

  // Коды ответа сервера
  static STATUS_OK = 200
  static STATUS_NOT_FOUND = 404
  static STATUS_ERROR = 500

  // Группа логирования
  static LOGGER_GROUP = "server"

  /**
   * Инициализировать сервер
   * @param {Object} eventBus 
   * @param {Function} handler 
   * @param {Object} config 
   */
  constructor(eventBus, handler, config) {
    this.eventBus = eventBus || {}
    this.handler = handler || this.defaultRequestHandler
    this.config = config || {}
    this.server = this.httpDriver.createServer(this.requestHandler)
  }

  /**
   * Сервер слушает HTTPS соединение
   * @return {Boolean}
   */
  get isHTTPS() {
    return (this.config.ssl && this.config.ssl.enable) || false
  }

  /**
   * Драйвер обработки соединения 
   * @return {Object}
   */
  get httpDriver() {
    return this.isHTTPS ? https : http
  }

  /**
   * Обработчик запросов по умолчанию
   * @return {Function}
   */
  get defaultRequestHandler() {
    return () => {}
  }

  /**
   * Запустить сервер
   */
  start() {
    const port = this.config.port || Server.DEFAULT_PORT

    this.server.listen(port)
    this.eventBus.emit("logger:info", {
      group: Server.LOGGER_GROUP,
      title: "Сервер запущен",
    })
  }

  /**
   * Остановить сервер
   */
  stop() {
    this.server.close()
    this.eventBus.emit("logger:info", {
      group: Server.LOGGER_GROUP,
      title: "Сервер остоновлен",
    })
  }

  /**
   * Обработчик запросов
   * @param {Object} request 
   * @param {Object response 
   */
  requestHandler(request, response) {
    const protocol = this.isHTTPS ? "https" : "http"
    const headers = request.headers || {}
    const url = new URL(`${protocol}:${headers.host}${request.url}`)
    
    let body = ""

    request.on("data", data => {
      body += data
    })

    request.on("end", () => {
      try {
        body = JSON.parse(body)

         // Вызвать обработчик
        this.handler.call(null, { request, response, headers, body, url })

        // Логировать запрос
        this.eventBus.emit("logger:info", {
          group: Server.LOGGER_GROUP,
          title: `${request.method} запрос`,
          data: { url, headers, body }
        })
      } catch {
        // Логировать ошибку парсинга тела запроса
        this.eventBus.emit("logger:error", {
          group: Server.LOGGER_GROUP,
          title: `Невалидное тело запроса`,
          data: { url, headers, body }
        })
      }
    })
  }
}

module.exports = Server
