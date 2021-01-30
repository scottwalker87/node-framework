const errorHandler = require("./handlers/error")

module.exports = [
  {
    method: "GET", 
    path: "/", 
    handler: require("./handlers/main"),
    errorHandler
  },
  {
    method: "GET", 
    path: "hello/(?<name>\\w+)", 
    handler: require("./handlers/hello"),
    errorHandler
  }
]
