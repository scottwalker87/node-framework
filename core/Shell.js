const Container = require("./Container")
const Module = require("./Module")

/**
 * Командная оболочка
 */
class Shell {
  static ARG_FLAG_PREFIX = "-"
  static ARG_PARAM_PREFIX = "--"
  static ARG_VALUE_SEPARATOR = "="
  static ARG_POSITION_COMMAND_NAME = 2
  static ARG_POSITION_PARAMS = 3

  // Обработчики форматов типов параметров
  static typeFormatters = {
    default: value => value,
    string: value => String(value),
    number: value => parseFloat(value),
    list: value => value.split(",").map(value => value.trim()),
  }

  /**
   * Инициализировать оболочку
   * @param {Container|null} container контейнер зависимостей
   * @param {Array<Module>} modules модули
   * @param {Object} config конфигурация
   */
  constructor(container, modules, config) {
    // Проверить контейнер зависимостей
    if (container && !(container instanceof Container)) {
      throw "Shell: Экземпляр контейнера зависимостей не подходит для работы приложения"
    }
    // Проверить наличие подключенных модулей
    if (!modules.length) {
      throw "Shell: Для работы приложения необходимо подключить хотя бы один модуль"
    }
    // Проверить наличие подключенных модулей
    if (modules.some(appModule => !(appModule instanceof Module))) {
      throw "Shell: Для работы приложения необходимо, чтобы каждый модуль был эксземпляром класса Module"
    }

    // Подключить модули
    this.modules = modules || []
    
    // Установить конфигурацию
    this.config = config || {}

    // Подключить контейнер зависимостей
    this.toPlugContainer(container)
    
    // Подключить логгер
    this.toPlugLogger()
  }

  /**
   * Консольные команды приложения
   * @return {Array}
   */
  get commands() {
    const commands = []

    // Обойти модули
    this.modules.forEach(appModule => {
      const moduleCommands = appModule.commands || []

      // Обойти команды
      moduleCommands.forEach(command => {
        const params = command.params || [] 
        const flags = command.flags || []

        commands.push({ ...command, params, flags, moduleId: appModule.id })
      })
    })

    return commands
  }

  /**
   * Зависимости приложения
   * @return {Object}
   */
  get dependencies() {
    let dependencies = this.coreDependencies

    // Обойти модули
    this.modules.forEach(appModule => {
      const moduleDependencies = appModule.dependencies || {}

      // Добавить зависимости
      dependencies = { ...dependencies, ...moduleDependencies }
    })

    return dependencies
  }

  /**
   * Зависимости ядра фреймворка 
   * @return {Object}
   */
  get coreDependencies() {
    return {
      // Логгер приложения
      "core/Logger": () => {
        const Logger = require("./Logger")
        const config = this.config.logger || {}

        return new Logger(config)
      },

      // Контекст для обработчиков команд приложения
      "core/CommandContext": ({}, { command, params }) => { 
        const CommandContext = require("./contexts/CommandContext")

        return new CommandContext(this.container, command, params)
      }
    }
  }

  /**
   * Парсить переданные аргументы
   * @param {Array} args
   * @return {Object}
   */
  parse = args => {
    const name = args[Shell.ARG_POSITION_COMMAND_NAME]
    const command = this.findCommand(name)
    const params = {}
    const flags = {}

    for (const arg of args.slice(Shell.ARG_POSITION_PARAMS)) {
      // Если это параметр
      if (arg.startsWith(Shell.ARG_PARAM_PREFIX)) {
        const [key, value] = arg.replace(Shell.ARG_PARAM_PREFIX, "").split(Shell.ARG_VALUE_SEPARATOR)
    
        params[key] = value
      } 
    
      // Если это флаг
      else if (arg.startsWith(Shell.ARG_FLAG_PREFIX)) {
        const key = arg.replace(Shell.ARG_FLAG_PREFIX, "")
    
        flags[key] = true
      }
    }

    return { 
      name,
      params: this.normalizeParams(command, params, flags) 
    }
  }

  /**
   * Нормализовать парметры комманды
   * @param {Object} command
   * @param {Object} passedParams 
   * @param {Object} passedFlags 
   * @return {Object}
   */
  normalizeParams = (command, passedParams, passedFlags) => {
    const params = {}

    // Обойти параметры команды 
    for (const { key, ...param } of command.params) {
      const formatter = Shell.typeFormatters[param.type] || Shell.typeFormatters.default
      const value = passedParams[key]
      const name = param.alias || key

      if (!value && param.required) {
        throw `Shell: Необходимо указать обязательный параметр "${key}"`
      }
      else if (!value && param.default !== undefined) {
        params[name] = param.default ? formatter.call(null, param.default) : null
      } 
      else {
        params[name] = value ? formatter.call(null, value) : null
      }
    }

   // Обойти флаги команды 
    for (const { key, alias } of command.flags) {
      const value = passedFlags[key]

      params[alias || key] = value ? true : false
    }

    return params
  }

  /**
   * Выполнить команду
   * @param {String} name 
   * @param {Object} params 
   * @return {Promise<void>}
   */
  async exec(name, params) {
    params = params || {}

    try {
      const command = this.findCommand(name)
      const context = this.container.make("core/CommandContext", { command, params })

      await command.handler.call(null, context)
    } catch (error) {
      this.logger.error("application", `Ошибка обработки команды "${name}"`, error)
    }
  }

  /**
   * Найти комманду
   * @param {String} name 
   * @return {Object}
   */
  findCommand(name) {
    const command = this.commands.find(command => command.name === name)

    if (!command || !command.handler) {
      throw `Shell: Команда "${name}" не найдена`
    }

    return command
  }

  /**
   * Подключить контейнер зависимостей
   * @param {Container|null}
   */
  toPlugContainer(container) {
    this.container = container || new Container()
    this.container.setBatch(this.dependencies)
  }

  /**
   * Подключить логгер
   */
  toPlugLogger() {
    this.logger = this.container.make("core/Logger")
  }
}

module.exports = Shell
