const { ipcMain } = require('electron')

const init = () => {
  ipcMain.on('asynchronous-message', (event, arg) => {
    event.reply('asynchronous-reply', 're: ' + arg)
  })
}

module.exports = init
