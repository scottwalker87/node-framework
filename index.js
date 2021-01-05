const config = require("./config/main.local")
const Application = require("./Application")

const app = new Application(config)
app.run()
