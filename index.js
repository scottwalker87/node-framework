const config = require("./config/main.local")
const modules = require("./modules")
const Application = require("./Application")

// Инициализировать приложение
const app = new Application(modules, config)

// Запустить приложение
app.run()
