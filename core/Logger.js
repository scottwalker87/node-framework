const fs = require("fs")
const path = require("path")

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
    const date = new Date()
    const handler = this.config.dateFormat instanceof Function ? this.config.dateFormat : null

    if (handler) {
      return handler(date)
    }

    return date.toLocaleString()
  }
  
  /**
   * Сформировать строку лога
   * @param {String} message 
   * @param {*} data 
   */
  makeLine(message, data = null) {
    const description = data ? JSON.stringify(data, null, "  ") : null
    const content = description ? `${message}\r\n${description}\r\n\r\n` : `${message}\r\n\r\n`

    return `${this.currentDate} - ${content}`
  }

  /**
   * Логировать
   * @param {String} group 
   * @param {String} message 
   * @param {*} data 
   * @param {String} level 
   */
  log(group, message, data = null, level = Logger.LEVEL_INFO) {
    // Если указана директория для логов
    if (this.dir) {
      // Проверить директорию на доступность к записи
      fs.access(this.dir, fs.constants.F_OK | fs.constants.W_OK, accessError => {
        // Если директория не существует или не доступна для записи 
        if (accessError) {
          console.error(`Директория ${this.dir} не доступна для записи`)
        } else {
          const file = path.resolve(this.dir, `${group}.${level}.log`)
          const line = this.makeLine(message, data)
  
          // Записать лог в файл
          fs.writeFile(file, line, { flag: "a" }, writeError => {
            // Если файл не может быть создан или не доступен для записи
            if (writeError) {
              console.error(`Файл ${file} не доступна для записи`)
            }
          })
        }
      })
    }
  }

  /**
   * Логировать информацию
   * @param {String} group 
   * @param {String} message 
   * @param {*} data 
   */
  info(group, message, data) {
    this.log(group, message, data, Logger.LEVEL_INFO)

    console.log("Info:", group, message)
  }

  /**
   * Логировать ошибку
   * @param {String} group 
   * @param {String} message 
   * @param {*} data 
   */
  error(group, message, data) {
    this.log(group, message, data, Logger.LEVEL_ERROR)

    console.error("Error:", group, message)
  }
}

module.exports = Logger
