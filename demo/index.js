const { Application } = require("@scottwalker/node-framework")
const config = require("./config/main")
const modules = require("./modules")

// Инициализировать приложение
const app = new Application(modules, config)

// Запустить приложение
app.run()
