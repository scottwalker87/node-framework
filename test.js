const http = require("http")
const intl = require("util")

const server = http.createServer((req, res) => {
  const data = {
    method: req.method,
    url: new URL(`http://${req.headers.host}${req.url}`),
    headers: req.headers
  }

  console.log(intl.inspect(data, false, Infinity, true))

  res.end()
})

server.listen(3000, "localhost")

// const data = new Map()
// data.set("asd", 123)

// console.log(data)
// console.log(Object.fromEntries(data))

// const fs = require("fs")
// const dir = "./logs"

// fs.access(dir, fs.constants.F_OK | fs.constants.W_OK, err => {
//   if (err) {
//     console.log(false)
//   } else {
//     console.log(true)
//   }
// })
