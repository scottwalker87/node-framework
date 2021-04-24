/**
 * Контейнер зависимостей
 */
 class Container {
  // Методы создания экземпляра зависимости
  static MEHTOD_INVOKE = "invoke"
  static MEHTOD_MAKE = "make"
  
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
    }
  }

  /**
   * Уставноить зависимость
   * @param {String} address адрес зависимости 
   * @param {Function} instruction инструкция сборки зависимости
   */
  set(address, instruction) {
    if (!address) {
      throw "Укажите адрес зависимости"
    }
    if (this.dependencies[address]) {
      throw `Завсисимость по адресу "${address}" уже существует в контейнере`
    }
    if (!(instruction instanceof Function)) {
      throw `Укажите инструкцию сборки зависимости по адресу "${address}" как функцию обратного вызова`
    }

    this.dependencies[address] = instruction
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
   * @return {Function} инструкция сборки зависимости
   */
  get(address) {
    const instruction = this.dependencies[address]

    if (!instruction) {
      throw `Завсисимость по адресу "${address}" не найдена в контейнере`
    }

    return instruction
  }

  /**
   * Вызвать экземпляр зависимости 
   * @param {String} address адрес зависимости 
   * @return {Object} экземпляр зависимости
   */
  invoke(address) {
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

    if (!address) {
      throw "Укажите адрес зависимости"
    }

    return this.get(address).call(null, this.context, params)
  }
}

module.exports = Container
