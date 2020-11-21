//import { ipcRenderer } from 'electron'
const electron = window.require('electron')
function hello() {
  electron.ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // prints "pong"
  })
  electron.ipcRenderer.send('asynchronous-message', 'message')
}

export { hello }
