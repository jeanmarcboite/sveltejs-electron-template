const { app, BrowserWindow } = require('electron')
const contextMenu = require('electron-context-menu')
const path = require('path')
const config = require('./config')
const ipcmain = require('./ipcmain')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}
require('electron-reload')(path.join(__dirname, '../..'), {
  electron: path.join(__dirname, '../../node_modules', '.bin', 'electron'),
})

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: config.get('width'),
    height: config.get('height'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  })

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize()
    config.set({ width, height })
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'public', 'index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

contextMenu({
  prepend: (defaultActions, params, browserWindow) => [
    {
      label: 'Rainbow',
      // Only show it when right-clicking images
      visible: params.mediaType === 'image',
    },
    {
      label: 'Search Google for “{selection}”',
      // Only show it when right-clicking text
      visible: params.selectionText.trim().length > 0,
      click: () => {
        shell.openExternal(
          `https://google.com/search?q=${encodeURIComponent(
            params.selectionText,
          )}`,
        )
      },
    },
  ],
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcmain()
