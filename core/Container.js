/**
 * Контейнер зависимостей
 */
 class Container {
  // Признак того, что параметр для конструктора класса является зависимостью
  static PARAM_DEPENDENCY_SIGN = "@"

  // Методы создания экземпляра зависимости
  static MEHTOD_INVOKE = "invoke"
  static MEHTOD_MAKE = "make"
  static MEHTOD_FROM = "from"

  /**
   * Инициализировать контейнер
   * @param {Object} dependencies карта зависимостей
   */
  constructor(dependencies) {
    this.dependencies = {}
    this.instances = {}

    // Установить зависимости, если они переданы
    if (dependencies) {
      this.setBatch(dependencies)
    }
  }

  /**
   * Контекст для вызовов в параметрах-завсисмостях
   * @return {Object} доступные методы
   */
  get context() {
    return {
      [Container.MEHTOD_INVOKE]: this.invoke.bind(this),
      [Container.MEHTOD_MAKE]: this.make.bind(this),
      [Container.MEHTOD_FROM]: this.from.bind(this),
    }
  }

  /**
   * Уставноить зависимость
   * @param {String} address адрес зависимости 
   * @param {Object} instruction инструкция сборки зависимости
   */
  set(address, instruction) {
    if (!address) {
      throw "Укажите адрес зависимости"
    }
    if (!(instruction instanceof Object)) {
      throw `Укажите инструкцию сборки зависимости по адресу "${address}"`
    }
    if (this.dependencies[address]) {
      throw `Завсисимость по адресу "${address}" уже существует в контейнере`
    }
    if (!instruction.from) {
      throw `Укажите источник зависимости по адресу "${address}"`
    }

    this.dependencies[address] = { 
      from: instruction.from,
      params: instruction.params || {}
    }
  }

  /**
   * Установить партию зависимостей
   * @param {Object} dependencies карта зависимостей
   */
  setBatch(dependencies) {
    for (const [address, instruction] of Object.entries(dependencies)) {

      // Уставноить зависимость
      this.set(address, instruction)
    }
  }

  /**
   * Получить инструкцию сборки зависимости
   * @param {String} address адрес зависимости 
   * @return {Object} инструкция сборки зависимости
   */
  get(address) {
    const instruction = this.dependencies[address]

    if (!instruction) {
      throw `Завсисимость по адресу "${address}" не найдена в контейнере`
    }
    if (!instruction.from) {
      throw `Не указан источник зависимости по адресу "${address}"`
    }

    return instruction
  }

  /**
   * Вызвать экземпляр зависимости 
   * @param {String} address адрес зависимости 
   * @return {Object} экземпляр зависимости
   */
  invoke(address) {
    if (!address) {
      throw "Укажите адрес зависимости"
    }

    if (!this.instances[address]) {
      this.instances[address] = this.make(address)
    }

    return this.instances[address]
  }

  /**
   * Изготовить новый экземпляр зависимости 
   * @param {String} address адрес зависимости 
   * @param {Object} params параметры для конструктора класса
   * @return {Object} экземпляр зависимости
   */
  make(address, params) {
    params = params || {}

    const instruction = this.get(address)
    const instructionParams = instruction.params || {}
    const dependencyParams = this.parseParams({ ...instructionParams, ...params })
    const constructorParams = this.parseConstructorParams(instruction.from).map(arg => {
      return dependencyParams[arg] || undefined
    })

    return new instruction.from(...constructorParams)
  }

  /**
   * Получить источник зависимости 
   * @param {String} address адрес зависимости 
   * @return {Object} калсс-конструктор зависимости
   */
  from(address) {
    const instruction = this.get(address)

    return instruction.from
  }

  /**
   * Парсить параметры для конструктора класса из карты параметров зависимости
   * @param {Object} paramsMap карта параметров зависимости
   * @param {Object} параметры для конструктора класса
   */
  parseParams(paramsMap) {
    const params = {}

    for (let [key, value] of Object.entries(paramsMap)) {
      // Если в ключе параметра найден признак зависимости
      if (key.startsWith(Container.PARAM_DEPENDENCY_SIGN)) {

        // Убрать из ключа параметра признак зависимости
        key = key.substr(Container.PARAM_DEPENDENCY_SIGN.length) || null

        // Проверить корректность ключа параметра зависимости
        if (!key) {
          throw "Неприемлемое название ключ параметра зависимости"
        }
        // Проверить ключ параметра зависимости на совпадает с ключом другого параметра
        if (paramsMap[key]) {
          throw "Ключ параметра зависимости совпадает с ключом другого параметра"
        }
        // Проверить, является ли параметр функцией
        if (typeof value !== "function") {
          throw "Значение параметра зависимости обязательно должно быть функцией"
        }

        // Записать результат вызова функции как значение параметра
        params[key] = value.call(null, this.context)
      } else {
        params[key] = value
      }
    }

    return params
  }

  /**
   * Парсить параметры конструктора класса
   * @param {Object} from класс
   * @param {Array} порядок названий параметров конструктора 
   */
  parseConstructorParams(from) {
    from = from.toString()

    const { groups } = from.match(/constructor\s*\((?<args>.*?)\)/)
    const args = groups.args || ""

    return args.replace(/\s*/g, "").split(",")
  }
}

module.exports = Container
