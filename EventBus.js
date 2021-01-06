const EventEmitter = require("events")

/**
 * Шина событий
 */
class EventBus extends EventEmitter {}

module.exports = EventBus
