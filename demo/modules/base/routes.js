const handlers = require("./handlers")

module.exports = [
  {
    method: "GET", 
    path: "/", 
    handler: handlers.main 
  },
  {
    method: "POST", 
    path: "/post", 
    handler: handlers.post 
  },
  // { 
  //   method: "GET", 
  //   path: "books/read/(?<id>\d+)", 
  //   handler: ({ route, request, response, context, headers, params, body, url }) => {}, 
  //   errorHandler: () => {} 
  // },
  // { 
  //   method: "GET", 
  //   path: "books/filter/(\d+)/(\w+)/(\d+)/desc", 
  //   handler: handlers.list 
  // },
  // { 
  //   method: "POST", 
  //   path: "books/add", 
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  //   handler: handlers.add 
  // },
]
