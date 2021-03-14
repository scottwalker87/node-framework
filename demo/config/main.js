const path = require("path")

module.exports = {
  router: {
    options: {
      jsonResponse: true
    },
    headers: {
      "Content-Type": "application/json"
    },
    handler: ({ response }) => response.error("error"),
    errorHandler: ({ response }) => response.error("error"),
  },
  logger: {
    dir: path.resolve(__dirname, "../logs"),
  },
  server: {
    host: "localhost",
    port: 3030,
    ssl: {}
  }
}
