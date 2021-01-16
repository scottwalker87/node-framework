const path = require("path")

module.exports = {
  router: {
    defaultHeaders: {
      "Content-Type": "application/json"
    },
    defaultHandler: ({ context }) => context.ok("default"),
    defaultErrorHandler: ({ context }) => context.error("error"),
  },
  logger: {
    dir: path.resolve(__dirname, "../logs"),
  },
  server: {
    host: "localhost",
    port: 3000,
    ssl: {
      enable: false
    }
  }
}
