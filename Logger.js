const fs = require("fs")
const path = require("path")
const { formatDate, formatters } = require("./utils/date.util")

/**
 * Логгер
 */
class Logger {
  // Уровни логирования
  static LEVEL_INFO = "info"
  static LEVEL_ERROR = "error"

  /**
   * Инициализировать логгер
   * @param {Object} config 
   */
  constructor(config) {
    this.config = config || {}
  }

  /**
   * Директория для логов
   */
  get dir() {
    return this.config.dir || null
  }

  /**
   * Получить текущую дату
   * @return {String}
   */
  get currentDate() {
    const handler = this.config.dateFormat instanceof Function ? this.config.dateFormat : formatters.full

    return formatDate(new Date(), handler)
  }
  
  /**
   * Сформировать строку лога
   * @param {String} title 
   * @param {*} data 
   */
  makeLine(title, data) {
    const text = data ? JSON.stringify({ data }, null, "  ") : null
    const info = text ? `${title}\r\n${text}\r\n\r\n` : `${title}\r\n\r\n`

    return `${this.currentDate}: ${info}`
  }

  /**
   * Логировать
   * @param {String} group 
   * @param {String} title 
   * @param {*} data 
   * @param {String} level 
   */
  log(group, title, data = null, level = Logger.LEVEL_INFO) {
    // Если указана директория для логов
    if (this.dir) {
      // Проверить директорию на доступность к записи
      fs.access(this.dir, fs.constants.F_OK | fs.constants.W_OK), accessError => {
        // Если директория не существует или не доступна для записи 
        if (accessError) {
          console.error(`Директория ${this.dir} не доступна для записи`)
        } else {
          const file = path.resolve(this.dir, `${group}.${level}.log`)
          const line = this.makeLine(title, data)
  
          // Записать лог в файл
          fs.writeFile(file, line, { flag: "a" }, writeError => {
            // Если файл не может быть создан или не доступен для записи
            if (writeError) {
              console.error(`Файл ${file} не доступна для записи`)
            }
          })
        }
      }
    }
  }

  /**
   * Логировать информацию
   * @param {String} group 
   * @param {String} title 
   * @param {*} data 
   */
  info(group, title, data) {
    this.log(group, title, data, Logger.LEVEL_INFO)
  }

  /**
   * Логировать ошибку
   * @param {String} group 
   * @param {String} title 
   * @param {*} data 
   */
  error(group, title, data) {
    this.log(group, title, data, Logger.LEVEL_ERROR)
  }
}

module.exports = Logger
