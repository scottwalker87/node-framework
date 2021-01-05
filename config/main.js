module.exports = {
  router: {
    defaultHeaders: {
      "Content-Type": "application/json"
    },
    defaultHandler: () => {},
    defaultErrorHandler: () => {},
  },
  server: {
    port: 3000,
    ssl: {
      enable: false
    }
  }
}
