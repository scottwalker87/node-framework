# Node Framework

<img src="https://gregorykelleher.com/user/pages/01.blog/grav-post/nodejs.jpg" alt="node-framework" width="300"/>

[![NPM Package](https://img.shields.io/npm/v/@scottwalker/node-framework?style=for-the-badge)](https://www.npmjs.com/package/@scottwalker/node-framework)
[![Scottweb](https://img.shields.io/badge/Scottweb-Web%20Development-red?style=for-the-badge)](http://scottweb.ru/)

Простой и легковесный фреймворк для решения типовых задач

## Установка
Первичное развертывание проекта
```bash
npm init -y
npm i @scottwalker/node-framework
cp -r ./node_modules/@scottwalker/node-framework/demo/* .
node .
```
## Использование
Примеры базового использования фреймворка

#### Пример инициализации приложения **(index.js)**
```js
const { Application, Container } = require("@scottwalker/node-framework")
const config = require("./config/main")
const modules = require("./modules")

// Инициализировать контейнер зависимостей
const container = new Container()

// Инициализировать приложение
const app = new Application(container, modules, config)

// Запустить приложение
app.run()
```

#### Пример простой конфигурации **(config.js)**
```js
const path = require("path")

module.exports = {
  router: {
    options: {
      jsonResponse: true
    },
    headers: {
      "Content-Type": "application/json"
    },
    handler: ({ response }) => response.ok("default"),
    errorHandler: ({ response }) => response.error("error"),
  },
  logger: {
    dir: path.resolve(__dirname, "../logs"),
  },
  server: {
    host: "localhost",
    port: 3030,
    ssl: {}
  }
}
```
Конфигурация имеет основные секции
```
router - Конфигурация роутера
  options - опции маршрутов по умолчанию
    jsonResponse - отдавать тело ответа в формате JSON
  headers - HTTP заголовки ответа по умолчанию
  handler - Обработчик успешных запросов к модулю по умолчанию
  errorHandler - Обработчик неудачных запросов к модулю по умолчанию

logger - Конфигурация логгера
  dir - Директория для логов
  dateFormat - Обработчик формата даты в логах

server - Конфигурация сервера
  host - Хост сервера
  port - Порт сервера
  ssl - Настройки SSL соединения
```

#### Пример описания модулей приложения **modules.js**
```js
const { Module } = require("@scottwalker/node-framework")

module.exports = [
  new Module("base", { 
    // Маршруты модуля
    routes: [
      {
        method: "GET", 
        path: "/", 
        handler: ({ response }) => response.ok("Hello World!"),
        errorHandler: ({ response }) => response.error("Goodbye World!"),
      },
    ],

    // Команды модуля
    commands: [
      {
        name: "base/hello",
        params: [
          { key: "name", type: "string", required: true },
          { key: "p", alias: "price", type: "number", default: 100 },
        ],
        flags: [
          { key: "a", alias: "all" }
        ],
        handler: ({ params }) => {
          const { name, price, all } = params 

          console.log({ name, price, all })
        }
      }
    ],

    // Зависимости модуля
    dependencies: {
      "base/models/User": ({ name }) => new require("./models/User")(name)
    }
  })
]
```
Каждый модуль обязательно должен иметь свойства
```
routes - Описание маршрутизации модуля
dependencies - Описание зависимостей модуля
```

## Контейнер зависимостей
В версии 2.0.1 значительно переделана структура фреймворка по причине использования контейнера зависимостей.

Контейнер зависимостей использует 2 стратегии получения внедренных зависимостей
```
invoke - Вызвать зависимость, которая при первом вызове создается по стратегии make, а при дальнейших invoke вызовах, используется инициализированный ранее экземпляр зависимости  
make - Создать новый экземпляр зависимости
```

#### Пример описания зависимостей приложения
```js
const { Container } = require("@scottwalker/node-framework")

// Инициализировать контейнер зависимостей
const container = new Container({
  // Клиенты
  "app/clients/HttpClient": ({}, { host, strict }) => new require("./clients/HttpClient")(host, strict),
  "app/clients/MongoClient": ({}, { config }) => new require("./clients/MongoClient")(config),

  // Модели
  "app/models/CampaignModel": () => new require("./models/CampaignModel")(),
  
  // Репозитории
  "app/repositories/CampaignRepository": ({ invoke }) => {
    const CampaignRepository = require("./repositories/CampaignRepository")
    const mongoClient = invoke("app/clients/MongoClient")

    return new CampaignRepository(mongoClient)
  },

  // Сервисы
  "app/services/CampaignService": ({ invoke, make }) => {
    const CampaignService = require("./services/CampaignService")
    const httpClient = invoke("app/clients/HttpClient", { host: "localhost", strict: true })
    const campaignRepository = make("app/repositories/CampaignRepository")

    return new CampaignService(httpClient, campaignRepository, { logged: true })
  }
})
```

## Командная оболочка
В версии 2.1.4 добавлен механизм для выполнения консольных команд приложения.

#### Пример инициализации консольного приложения
```js
const { Shell } = require("@scottwalker/node-framework")
const config = require("./config/main")
const modules = require("./modules")
const container = require("./container")(config)

// Инициализировать командную оболочку
const shell  = new Shell(container, modules, config)

// Парсить переданные аргументы 
const { name, params } = shell.parse(process.argv)

// Выполнить команду
shell.exec(name, params)
```
