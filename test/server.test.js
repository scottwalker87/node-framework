const Server = require("../core/Server")
const config = {
  host: "localhost",
  port: 4000,
  ssl: {
    enable: false
  }
}

const handler = ({ request, response, method, url, headers, body }) => {}
const server = new Server(handler, config)

test('Запуск сервера', async () => {
  try {
    await server.start()
  } catch (error) {
    expect(error).toMatch('error')
  }
})

test('Остановка сервера', async () => {
  try {
    await server.stop()
  } catch (error) {
    expect(error).toMatch('error')
  }
})
