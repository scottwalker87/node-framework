/**
 * Получить форматированную дату
 * @param {Date} date дата
 * @param {Function} formatHandler обработчик формата
 * @return {String|null}
 */
const formatDate = (date, formatHandler) => {
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
  if (formatHandler instanceof Function) {
    return formatHandler.call(null, data)
  }

  return null
}

// Обработчики форматов
const formatters = {
  /**
   * Форматировать дату
   * @param {Object} data 
   * @return {String}
   */
  date: ({ year, month, day }) => {
    return `${year}.${month}.${day}`
  },

  /**
   * Форматировать дату и время
   * @param {Object} data 
   * @return {String}
   */
  dateTime: ({ year, month, day, hour, minutes }) => {
    return `${year}.${month}.${day} ${hour}:${minutes}`
  },

  /**
   * Форматировать дату и время (с секундами)
   * @param {Object} data 
   * @return {String}
   */
  dateTimeWithSeconds: ({ year, month, day, hour, minutes, seconds }) => {
    return `${year}.${month}.${day} ${hour}:${minutes}:${seconds}`
  },

  /**
   * Форматировать дату и время полностью
   * @param {Object} data 
   * @return {String}
   */
  full: ({ year, month, day, hour, minutes, seconds, milliseconds }) => {
    return `${year}.${month}.${day} ${hour}:${minutes}:${seconds}:${milliseconds}`
  }
}

module.exports = { formatDate, formatters }
