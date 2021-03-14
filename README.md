# Node Framework

<img src="https://nodejs.org/static/images/logos/nodejs-new-pantone-black.svg" alt="node-framework" width="300"/>

[![Build Version](https://img.shields.io/github/package-json/v/scottwalker87/node-framework?style=for-the-badge)](https://github.com/scottwalker87/node-framework)
[![NPM Package](https://img.shields.io/npm/v/@scottwalker/node-framework?style=for-the-badge)](https://www.npmjs.com/package/@scottwalker/node-framework)
[![Scottweb](https://img.shields.io/badge/Scottweb-Web%20Development-red?style=for-the-badge)](http://scottweb.ru/)

Простой и легковесный фреймворк для решения типовых задач

## Установка
Первичное развертование проекта
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
    routes: [
      {
        method: "GET", 
        path: "/", 
        handler: ({ response }) => response.ok("Hello World!"),
        errorHandler: ({ response }) => response.error("Goodbye World!"),
      },
    ],
    dependencies: {
      "base/models/User": { from: require("./models/User"), params: { name: null } }
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
В версии 2.0.1 значительно передлана структура фреймворка по причине использования контейнера зависимостей.

Контейнер зависимостей использует 3 стратегии получения внедренных зависимостей
```
invoke - Вызвать зависимость, которая при первом вызове создается по стратегии make, а при дальнейших invoke вызовах, используется инициализированный ранее экземпляр зависимости  
make - Создать новый экземпляр зависимости
from - Получить класс зависимости без создания экхемпляра зависимости
```

#### Пример использования контейнера зависимостей
```js
const { Container } = require("@scottwalker/node-framework")

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
```
