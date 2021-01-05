const fs = require("fs")
const dir = "./logs"

fs.access(dir, fs.constants.F_OK | fs.constants.W_OK, err => {
  if (err) {
    console.log(false)
  } else {
    console.log(true)
  }
})
