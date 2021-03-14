const { Application, Container } = require("@scottwalker/node-framework")
const config = require("./config/main")
const modules = require("./modules")

// Инициализировать контейнер зависимостей
const container = new Container()

// Инициализировать приложение
const app = new Application(container, modules, config)

// Запустить приложение
app.run()
