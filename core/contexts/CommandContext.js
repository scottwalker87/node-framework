/**
 * Контекст команды приложения
 */
class CommandContext {
  /**
   * Инициализировать контекст
   * @param {Object} container контейнер зависимостей
   */
  constructor(container, command, params) {
    this.container = container
    this.command = command
    this.params = params
  }

  /**
   * ID моудля
   * @return {Object}
   */
  get moduleId() {
    return this.command.moduleId || "unknown"
  }
}

module.exports = CommandContext
