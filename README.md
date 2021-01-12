# Node Framework

[![Build Status](https://img.shields.io/github/checks-status/scottwalker87/node-framework/main?style=for-the-badge)](https://github.com/scottwalker87/node-framework)

Простой и легковесный фреймворк для решения типовых задач

## Установка
Первичное развертование проекта
```bash
npm i @scottwalker/node-framework
cp -r ./node_modules/@scottwalker/node-framework/demo/* .
node .
```
## Использование
### Пример инициализации приложения **(index.js)**
```js
const { Application } = require("@scottwalker/node-framework")
const config = require("./config")
const modules = require("./modules")

// Инициализировать приложение
const app = new Application(modules, config)

// Запустить приложение
app.run()
```

### Пример простой конфигурации **(config.js)**
```js
const path = require("path")

module.exports = {
  router: {
    defaultHeaders: {
      "Content-Type": "application/json"
    },
    defaultHandler: ({ context }) => context.ok("default"),
    defaultErrorHandler: ({ context }) => context.error("error"),
  },
  logger: {
    dir: path.resolve(__dirname, "../logs"),
  },
  server: {
    host: "localhost",
    port: 3000,
    ssl: {}
  }
}
```
Конфигурация имеет основные секции
- **router** - Конфигурация роутера
  - **defaultHeaders** - HTTP заголовки ответа по умолчанию
  - **defaultHandler** - Обработчик успешных запросов к модулю по умолчанию
  - **defaultErrorHandler** - Обработчик неудачных запросов к модулю по умолчанию
- **logger** - Конфигурация логгера
  - **dir** - Директория для логов
- **server** - Конфигурация сервера
  - **host** - Хост сервера
  - **port** - Порт сервера
  - **ssl** - Настройки SSL соединения

### Пример описания модулей приложения **modules.js**
```js
module.exports = [
  [
    id: "base",
    routes: [
      {
        method: "GET", 
        path: "/", 
        handler: ({ context }) => context.ok("Hello World!"),
        errorHandler: ({ context }) => context.error("Goodbye World!"),
      },
    ]
  ]
]
```
Каждый модуль обязательно должен иметь свойства
- **id** - Идентификатор модуля
- **routes** - Описание маршрутизации модуля
