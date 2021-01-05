const http = require("http")
const https = require("https")

/**
 * Сервер
 */
class Server {
  static DEFAULT_PORT = 3000

  /**
   * Инициализировать сервер
   * @param {Function} handler 
   * @param {Object} config 
   */
  constructor(handler, config) {
    this.handler = handler || this.defaultRequestHandler
    this.config = config || {}
    this.server = this.httpDriver.createServer(this.requestHandler)
  }

  /**
   * Драйвер обработки соединения 
   * @return {Object}
   */
  get httpDriver() {
    const isSSL =  (this.config.ssl && this.config.ssl.enable) || false

    return isSSL ? https : http
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
  }

  /**
   * Остановить сервер
   */
  stop() {
    this.server.close()
  }

  /**
   * Обработчик запросов
   * @param {Object} request 
   * @param {Object response 
   */
  requestHandler(request, response) {
    let body = ""

    request.on("data", data => {
      body += data
    })

    request.on("end", () => this.handler.call(null, { request, response, body }))
  }
}

module.exports = Server
