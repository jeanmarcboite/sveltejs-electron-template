const Store = require('electron-store')

const schema = {
  width: {
    type: 'number',
    minimum: 100,
    default: 800,
  },
  height: {
    type: 'number',
    minimum: 100,
    default: 600,
  },
}

const config = new Store(schema)

module.exports = config
