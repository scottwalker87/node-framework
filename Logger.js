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
    const data = {
      year: date.getFullYear(),
      month: String(date.getMonth() + 1).padStart(2, "0"),
      day: String(date.getDate()).padStart(2, "0"),
      hour: String(date.getHours()).padStart(2, "0"),
      minutes: String(date.getMinutes()).padStart(2, "0"),
      seconds: String(date.getSeconds()).padStart(2, "0"),
      milliseconds: String(date.getMilliseconds()).padStart(3, "0")
    }

    // Если есть метод форматирования даты
    if (this.config.dateFormat instanceof Function) {
      return this.config.dateFormat.call(null, data)
    }

    // Формат по умолчанию
    return `${year}.${month}.${day} ${hour}:${minutes}:${seconds}:${milliseconds}`
  }

  /**
   * Логировать
   * @param {String} group 
   * @param {String} level 
   * @param {String} title 
   * @param {*} data 
   */
  log(group, level, title, data) {
    // Если указана директория для логов
    if (this.dir) {
      // Проверить директорию на доступность к записи
      fs.access(this.dir, fs.constants.F_OK | fs.constants.W_OK), accessError => {
        // Если директория не существует или не доступна для записи 
        if (accessError) {
          console.error(`Директория ${this.dir} не доступна для записи`)
        } else {
          const file = path.resolve(this.dir, `${group}.${level}.log`)
          const text = JSON.stringify(data, null, "  ")
          const content = `${this.currentDate}: ${title}\r\n${text}\r\n\r\n`
  
          // Записать логи в файл
          fs.writeFile(file, content, { flag: "a" }, writeError => {
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
    this.log(group, Logger.LEVEL_INFO, title, data)
  }

  /**
   * Логировать ошибку
   * @param {String} group 
   * @param {String} title 
   * @param {*} data 
   */
  error(group, title, data) {
    this.log(group, Logger.LEVEL_ERROR, title, data)
  }
}

module.exports = Logger
