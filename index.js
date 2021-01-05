const config = require("./config/main")
const Application = require("./Application")

const app = new Application(config)
app.run()
