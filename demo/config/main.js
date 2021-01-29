const path = require("path")

module.exports = {
  router: {
    options: {
      jsonResponse: true
    },
    headers: {
      "Content-Type": "application/json"
    },
    handler: ({ ok }) => ok("default"),
    errorHandler: ({ error }) => error("error"),
  },
  logger: {
    dir: path.resolve(__dirname, "../logs"),
  },
  server: {
    host: "localhost",
    port: 3030,
    ssl: {
      enable: false
    }
  }
}
