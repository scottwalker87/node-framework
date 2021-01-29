module.exports = [
  {
    method: "GET", 
    path: "/", 
    handler: require("./handlers/main"),
    errorHandler: require("./handlers/error")
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
