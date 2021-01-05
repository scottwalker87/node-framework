const handlers = require("./handlers")

module.exports = [
  {
    method: "GET", 
    path: "books/list", 
    handler: handlers.list 
  },
  { 
    method: "GET", 
    path: "books/read/(?<id>\d+)", 
    handler: ({ request, response }) => {}, 
    errorHandler: () => {} 
  },
  { 
    method: "POST", 
    path: "books/add", 
    headers: {
      "Content-Type": "application/json"
    },
    handler: handlers.add 
  },
]
