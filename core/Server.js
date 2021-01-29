const http = require("http")
const https = require("https")

/**
 * HTTP/HTTPS сервер
 */
class Server {
  // Порт по умолчанию
  static DEFAULT_HOST = "localhost"
  static DEFAULT_PORT = 3030

  // Коды ответа сервера
  static STATUS_OK = 200
  static STATUS_NOT_FOUND = 404
  static STATUS_ERROR = 500

  /**
   * Инициализировать сервер
   * @param {Object} eventBus 
   * @param {Function} handler 
   * @param {Object} config 
   */
  constructor(eventBus, handler, config) {
    // Проверки на наличие обязательных параметров
    if (!eventBus) {
      throw "Server: Необходимо передать шину событий (параметр eventBus)"
    }
    if (!handler) {
      throw "Server: Необходимо передать обработчик запросов (параметр handler)"
    }

    this.eventBus = eventBus
    this.handler = handler
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
   * Origin
   * @return {String}
   */
  get origin() {
    return `${this.protocol}://${this.host}:${this.port}`
  }

  /**
   * Запустить сервер
   */
  start() {
    return new Promise(resolve => {
      this.server.listen(this.port, this.host, () => {
        
        // Логировать новый статус сервера
        this.logInfo(`Сервер запущен на ${this.origin}`)
        
        resolve()
      })
    })
  }

  /**
   * Остановить сервер
   */
  stop() {
    return new Promise(resolve => {
      this.server.close(() => {
        
        // Логировать новый статус сервера
        this.logInfo("Сервер остоновлен")

        resolve()
      })
    })
  }

  /**
   * Обработчик запросов
   * @param {Object} request 
   * @param {Object response 
   */
  requestHandler(request, response) {
    const headers = request.headers || {}
    const method = request.method || ""
    const url = new URL(`${this.protocol}://${headers.host}${request.url}`)

    // Тело запроса
    let body = ""

    // Слушать событие передачи тела запроса 
    request.on("data", data => { body += data })

    // Слушать событие ошибки запроса
    request.on("error", error => {
      // Логировать ошибку парсинга тела запроса
      this.logError(`Ошибка ${method} запроса ${url}`, { method, url, headers, body, error })
    })

    // Слушать событие завершения запроса
    request.on("end", () => {
      // Логировать запрос
      this.logInfo(`${method} запрос ${url}`, { method, url, headers, body })

      // Вызвать обработчик
      this.handler.call(null, { request, response, method, url, headers, body })
    })
  }

  /**
   * Логировать данные
   * @param {String} title 
   * @param {*} data 
   */
  logInfo(title, data = {}) {
    this.eventBus.emit("log:info", { group: "server", title, data })

    console.log("Server log:", title)
  }

  /**
   * Логировать данные об ошибке
   * @param {String} title 
   * @param {*} data 
   */
  logError(title, data = {}) {
    this.eventBus.emit("log:info", { group: "server", title, data })

    console.error("Server error log:", title)
  }
}

module.exports = Server
