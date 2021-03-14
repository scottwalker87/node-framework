/**
 * Запрос к приложению 
 */
class Request {
  /**
   * Инициализировать запрос к приложению 
   * @param {String} origin origin запроса
   * @param {Object} incomingMessage входящие сообщение из node билиотеки http/https
   */
  constructor(origin, incomingMessage) {
    this.origin = origin
    this.incomingMessage = incomingMessage
    this.bodyChunks = []
  }

  /**
   * URL запроса
   * @return {String}
   */
  get url() {    
    return new URL(this.incomingMessage.url, this.origin)
  }

  /**
   * Заголовки запроса
   * @return {Object}
   */
  get headers() {
    return this.incomingMessage.headers || {}
  }

  /**
   * Протокол запроса
   * @return {String}
   */
  get protocol() {
    return this.url.protocol.replace(":", "")
  }

  /**
   * Хост запроса
   * @return {String}
   */
  get host() {
    return this.url.hostname
  }

  /**
   * Путь запроса
   * @return {String}
   */
  get path() {
    return this.url.pathname
  }

  /**
   * Порт запроса
   * @return {String}
   */
  get port() {
    return this.url.port
  }

  /**
   * Метод запроса
   * @return {String}
   */
  get method() {
    return this.incomingMessage.method
  }

  /**
   * Параметры запроса
   * @return {Object}
   */
  get params() {
    return {
      headers: this.headers,
      method: this.method,
      protocol: this.protocol,
      host: this.host,
      port: this.port,
      path: this.path,
      url: this.url.toString(),
      body: this.body
    }
  }

  /**
   * Получить параметры из тела запроса 
   * @return {Object}
   */
  get body() {
    const body = Buffer.concat(this.bodyChunks).toString()

    try {
      return JSON.parse(body)
    } catch {
      return body
    }
  }

  /**
   * Завершить запрос
   * @return {Promise<void>}
   */
  complete() {
    return new Promise((resolve, reject) => {
      // Слушать событие передачи тела запроса 
      this.incomingMessage.on("data", chunk => { this.bodyChunks.push(chunk) })

      // Слушать событие ошибки запроса
      this.incomingMessage.on("error", error => reject({ ...this.params, error }))

      // Слушать событие завершения запроса
      this.incomingMessage.on("end", () => resolve(this.params))
    })
  }
}

module.exports = Request
