const Container = require("../core/Container")

// Инициализировать контейнер зависимостей
const container = new Container({
  // Клиенты
  "app/clients/HttpClient": { from: require("./clients/HttpClient"), params: {} },
  "app/clients/MongoClient": { from: require("./clients/MongoClient"), params: config.mongo },

  // Модели
  "app/models/CampaignModel": { from: require("./models/CampaignModel") },
  
  // Репозитории
  "app/repositories/CampaignRepository": {
    from: require("./repositories/CampaignRepository"),
    params: {
      "@httpClient": ({ make }) => make("app/clients/HttpClient", { host: "localhost", exclude: true }),
      "@mongoClient": ({ make }) => make("app/clients/MongoClient")
    }
  },

  // Сервисы
  "app/services/CampaignService": {
    from: require("./services/CampaignService"),
    params: {
      "@httpClient": ({ invoke }) => invoke("app/clients/HttpClient"),
      "@campaignRepository": ({ make }) => make("app/repositories/CampaignRepository"),
      logged: true
    }
  }
})

container.set("app/clients/HttpClient", { from: require("./clients/HttpClient"), params: config.httpClient })
container.set("app/clients/SocketClient", { from: require("./clients/SocketClient") })

const httpClient = container.invoke("app/clients/httpClient")
const httpClient2 = container.make("app/clients/HttpClient", { token: "dkKjjsqwjIO21234Kk" })

const socket1 = container.make("app/clients/SocketClient", { host: "localhost:8080" })
const socket2 = container.make("app/clients/SocketClient", { host: "localhost:8081" })

const CampaignModel = container.from("app/models/CampaignModel")
const campaignModel = new CampaignModel()

// const httpClient = container.get("app/clients/httpClient")
const httpClient = container.make("app/clients/httpClient", {
  "@socketClient": "vendor/scott/SocketClient",
  "@apiClient": ({ make }) => make("vendor/scott/ApiClient", {
    "@logger": ({ invoke }) => invoke("app/clients/logClient"),
    token: "asd222wsssASSA"
  }),
  dev: true
})
