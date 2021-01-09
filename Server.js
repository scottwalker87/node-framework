const EventEmitter = require("events")
const http = require("http")
const https = require("https")

/**
 * Сервер
 */
class Server extends EventEmitter {
  // Порт по умолчанию
  static DEFAULT_HOST = "localhost"
  static DEFAULT_PORT = 3000

  // Коды ответа сервера
  static STATUS_OK = 200
  static STATUS_NOT_FOUND = 404
  static STATUS_ERROR = 500

  // Уровни логирования
  static LOGGER_LEVEL_INFO = "info"
  static LOGGER_LEVEL_ERROR = "error"

  // MIME типы
  static MIME_TYPE_JSON = "application/json"

  /**
   * Инициализировать сервер
   * @param {Function} handler 
   * @param {Object} config 
   */
  constructor(handler, config) {
    super()
    
    this.handler = handler || this.defaultRequestHandler
    this.config = config || {}
    this.server = this.httpDriver.createServer(this.requestHandler.bind(this))
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
    return (request, response) => response.end()
  }

  /**
   * Протокол
   * @return {String}
   */
  get protocol() {
    return this.isHTTPS ? "https" : "http"
  }

  /**
   * Хост
   * @return {String}
   */
  get host() {
    return this.config.host || Server.DEFAULT_HOST
  }

  /**
   * Порт
   * @return {Number}
   */
  get port() {
    return this.config.port || Server.DEFAULT_PORT
  }

  /**
   * URL
   * @return {String}
   */
  get url() {
    return `${this.protocol}://${this.host}:${this.port}`
  }

  /**
   * Запустить сервер
   */
  start() {
    this.server.listen(this.port, this.host, () => {
      // Логировать новый статус сервера
      this.log(Server.LOGGER_LEVEL_INFO, `Сервер запущен на ${this.url}`)
    })
  }

  /**
   * Остановить сервер
   */
  stop() {
    this.server.close(() => {
      // Логировать новый статус сервера
      this.log(Server.LOGGER_LEVEL_INFO, "Сервер остоновлен")
    })
  }

  /**
   * Обработчик запросов
   * @param {Object} request 
   * @param {Object response 
   */
  requestHandler(request, response) {
    const headers = request.headers || {}
    const method = request.method
    const url = new URL(`${this.protocol}://${headers.host}${request.url}`)
    
    let body = ""

    // Слушать событие передачи тела запроса 
    request.on("data", data => { body += data })

    // Слушать событие ошибки запроса
    request.on("error", error => {
      // Логировать ошибку парсинга тела запроса
      this.log(Server.LOGGER_LEVEL_ERROR, `Ошибка ${method} запроса ${url}`, { method, url, headers, body, error })
    })

    // Слушать событие завершения запроса
    request.on("end", () => {
      try {
        // Парсить тело запроса
        body = this.parseBody(headers, body)
      } catch (error) {
        // Логировать ошибку парсинга тела запроса
        this.log(Server.LOGGER_LEVEL_ERROR, `Невалидное тело ${method} запроса ${url}`, { method, url, headers, body, error })
      }

      // Логировать запрос
      this.log(Server.LOGGER_LEVEL_INFO, `${method} запрос ${url}`, { method, url, headers, body })

      // Вызвать обработчик
      this.handler.call(null, { request, response, method, url, headers, body })
    })
  }

  /**
   * Парсить тело запроса
   * @param {Object} headers 
   * @param {String} body 
   * @return {*}
   */
  parseBody(headers, body) {
    const contentTypeKey = Object.keys(headers).find(key => key.toLowerCase() === "content-type")
    const contentTypeValue = headers[contentTypeKey] || ""
    const isContentTypeJson = contentTypeValue.toLowerCase() === Server.MIME_TYPE_JSON

    return isContentTypeJson ? JSON.parse(body) : body
  }

  /**
   * Логировать
   * @param {String} type 
   * @param {String} title 
   * @param {*} data 
   */
  log(level, title, data = {}) {
    this.emit("log", { level, title, data })

    if (level === Server.LOGGER_LEVEL_ERROR) {
      console.error({ title, data })
    } else {
      console.log(title)
    }
  }
}

module.exports = Server
