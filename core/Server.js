const EventEmitter = require("events")
const http = require("http")
const https = require("https")

/**
 * HTTP/HTTPS сервер
 */
class Server extends EventEmitter {
  // Значения по умолчанию
  static DEFAULT_HOST = "localhost"
  static DEFAULT_PORT = 3030

  /**
   * Инициализировать сервер
   * @param {Object} container 
   * @param {Object} config 
   */
  constructor(container, config) {
    super()

    this.container = container
    this.config = config || {}
    this.server = this.driver.createServer(this.handler.bind(this))
  }

  /**
   * Сервер слушает SSL соединение
   * @return {Boolean}
   */
  get isSSL() {
    return (this.config.ssl && Object.keys(this.config.ssl).length) || false
  }

  /**
   * Драйвер обработки соединения 
   * @return {Object}
   */
  get driver() {
    return this.isSSL ? https : http
  }

  /**
   * Протокол
   * @return {String}
   */
  get protocol() {
    return this.isSSL ? "https" : "http"
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
        const message = `Сервер запущен на ${this.origin}`
        
        // Логировать новый статус сервера
        this.logInfo(message)
        
        // Инициировать событие запуска сервера
        this.emit("start", message, this.port, this.host)

        resolve(message)
      })
    })
  }

  /**
   * Остановить сервер
   */
  stop() {
    return new Promise(resolve => {
      this.server.close(() => {
        const message = "Сервер остоновлен"
        
        // Логировать новый статус сервера
        this.logInfo(message)

        // Инициировать событие остоновки сервера
        this.emit("stop", message)

        resolve(message)
      })
    })
  }

  /**
   * Обработчик запросов
   * @param {Object} incomingMessage 
   * @param {Object} serverResponse 
   */
  async handler(incomingMessage, serverResponse) {
    // Создать объект запроса
    const request = this.container.make("core/Request", { origin: this.origin, incomingMessage })

    // Создать объект ответа
    const response = this.container.make("core/Response", { serverResponse })

    try {
      // Завершить запрос
      const data = await request.complete()

      // Логировать запрос
      this.logInfo(`${data.method} запрос ${data.url}`, data)

      // Вызвать обработчик
      this.emit("handle", request, response)
    } catch (data) {

      // Логировать ошибку парсинга тела запроса
      // this.logError(`Ошибка ${data.method} запроса ${data.url}`, data)
    }
  }

  /**
   * Логировать данные
   * @param {String} message 
   * @param {*} data 
   */
  logInfo(message, data = {}) {
    this.emit("log", message, data)
    this.emit("log:info", message, data)

    // console.log("Server log:", message)
  }

  /**
   * Логировать данные об ошибке
   * @param {String} message 
   * @param {*} data 
   */
  // logError(message, data = {}) {
  //   this.emit("log", message, data)
  //   this.emit("log:error", message, data)

  //   console.error("Server error log:", message)
  // }
}

module.exports = Server
