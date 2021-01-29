/**
 * Контекст приложения
 */
class Context {
  // Коды ответа сервера
  static STATUS_OK = 200
  static STATUS_NOT_FOUND = 404
  static STATUS_ERROR = 500

  /**
   * Инициализировать контекст
   * @param {Object} eventBus шина событий 
   */
  constructor(eventBus) {
    this.eventBus = eventBus
  }

  /**
   * Создать контекст
   * @param {Object} params параметры контекста 
   * @return {Object} контекст
   */
  create({ route, request, response, headers, body }) {
    // ID моудля
    const moduleId = route.moduleId || "unknown"

    // URL запроса
    const url = route.url || {} 

    // GET параметры запроса
    const queryParams = url.searchParams ? Object.fromEntries(url.searchParams) : {}

    // Параметры маршрута (полученные вследствие парсинга маршрута роутером)
    const routeParams = route.params || {}

    /**
     * Параметры из тела запроса (если тело) 
     * @return {Object}
     */
    const getBodyParams = () =>{
      try {
        return JSON.parse(body)
      } catch {
        return { content: body }
      }
    }

    /**
     * Отправить ответ
     * @param {Number} code код ответа
     * @param {*} data тело ответа
     * @param {Object} headers заголовки
     * @param {Object} options опции
     */
    const send = (code, data, headers, options) => {
      const routeHeaders = route.headers || {}
      const routeOptions = route.options || {}

      // Нормализовать данные
      data = data || ""
      headers = { ...routeHeaders, ...(headers || {}) }
      options = { ...routeOptions, ...(options || {}) }

      // Форматировать тело в JSON, если это указано в опциях
      data = options.jsonResponse ? JSON.stringify(data) : data

      // Отправить заголовки
      response.writeHead(code, { ...routeHeaders, ...headers })

      // Отправить тело
      response.end(data)
    }

    return {
      queryParams,
      routeParams,
      bodyParams: getBodyParams(),

      /**
       * Положительный ответ
       * @param {*} data тело ответа
       * @param {Object} headers заголовки
       * @param {Object} options опции
       */
      ok: (data, headers, options) => {
        send(Context.STATUS_OK, data, headers, options)
      },

      /**
       * Ответ "ресурс не найден"
       * @param {*} data тело ответа
       * @param {Object} headers заголовки
       * @param {Object} options опции
       */
      notFound: (data, headers, options) => {
        send(Context.STATUS_NOT_FOUND, data, headers, options)
      },

      /**
       * Ответ "ошибка сервера" 
       * @param {*} data тело ответа
       * @param {Object} headers заголовки
       * @param {Object} options опции
       */
      error: (data, headers, options) => {
        send(Context.STATUS_ERROR, data, headers, options)
      },

      /**
       * Подписаться на событие из шины событий
       * @param {String} event название события
       * @param {Function} callback функция обратного вызова
       */
      on: (event, callback) => {
        this.eventBus.on(event, callback)
      },

      /**
       * Инициировать событие из шины событий
       * @param {String} event название события
       * @param {*} data дапнные
       */
      emit: (event, ...data) => {
        this.eventBus.emit(event, ...data)
      },

      /**
       * Логировать данные
       * @param {String} title 
       * @param {*} data 
       */
      logInfo: (title, data) => {
        this.eventBus.emit("log:info", { group: moduleId, title, data})
      },

      /**
       * Логировать данные об ошибке
       * @param {String} title 
       * @param {*} data 
       */
      logError: (title, data) => {
        this.eventBus.emit("log:error", { group: moduleId, title, data})
      }
    }
  }
}

module.exports = Context
