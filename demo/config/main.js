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
    dateFormat: ({ year, month, day, hour, minutes, seconds, milliseconds }) => {
      return `${year}.${month}.${day} ${hour}:${minutes}:${seconds}:${milliseconds}`
    }
  },
  server: {
    host: "localhost",
    port: 3000,
    ssl: {
      enable: false
    }
  }
}
