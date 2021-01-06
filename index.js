const config = require("./config/main.local")
const Application = require("./Application")

// Инициализировать приложение
const app = new Application(config)

// Запустить приложение
app.run()
