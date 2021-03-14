/**
 * Ответ приложения
 */
class Response {
  // Коды ответа
  static STATUS_OK = 200
  static STATUS_NOT_FOUND = 404
  static STATUS_ERROR = 500

  /**
   * Инициализировать ответ приложения
   * @param {Object} serverResponse ответ node билиотеки http/https
   * @param {Object} headers заголовки ответа
   * @param {Object} options опции ответа
   */
  constructor(serverResponse, headers, options) {
    this.serverResponse = serverResponse
    this.headers = headers || {}
    this.options = options || {}
  }

  /**
   * Установить заголовки ответа
   * @param {Object} headers 
   */
  setHeaders(headers) {
    this.headers = headers
  }

  /**
   * Установить опции ответа
   * @param {Object} headers 
   */
  setOptions(options) {
    this.options = options
  }

  /**
   * Отправить ответ
   * @param {Number} code код ответа
   * @param {*} data тело ответа
   * @param {Object} headers заголовки
   * @param {Object} options опции
   */
  send(code, data, headers, options) {
    data = data || ""
    headers = { ...this.headers, ...(headers || {}) }
    options = { ...this.options, ...(options || {}) }

    // Преобразовать данные в JSON строку, если это указано в опциях
    data = options.jsonResponse ? JSON.stringify(data) : data
    
    // Отправить заголовки
    this.serverResponse.writeHead(code, headers)

    // Отправить тело
    this.serverResponse.end(data)
  }

  /**
   * Ответ "OK"
   * @param {*} data тело ответа
   * @param {Object} headers заголовки
   * @param {Object} options опции
   */
  ok(data, headers, options) {
    this.send(Response.STATUS_OK, data, headers, options)
  }

  /**
   * Ответ "ресурс не найден"
   * @param {*} data тело ответа
   * @param {Object} headers заголовки
   * @param {Object} options опции
   */
  notFound(data, headers, options) {
    this.send(Response.STATUS_NOT_FOUND, data, headers, options)
  }

  /**
   * Ответ "ошибка сервера" 
   * @param {*} data тело ответа
   * @param {Object} headers заголовки
   * @param {Object} options опции
   */
  error(data, headers, options) {
    this.send(Response.STATUS_ERROR, data, headers, options)
  }
}

module.exports = Response
