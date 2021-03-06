// Modules to control application life and create native browser window
const {ipcMain, app, BrowserWindow} = require('electron')
const process = require('process')
const kill = require('kill-port')

global.sharedObj = {serverIP: null};

let mainWindow

function loadEditor() {

  console.log('main.js[11] port number', global.portNumber)

  // connect to self hosted editor
  let newWin = new BrowserWindow({width: 1600, height: 1000})
  // newWin.webContents.openDevTools()

  newWin.loadURL(`http://localhost:${global.portNumber || 3001}`)
  newWin.on('close', () => newWin = null)

  // mainWindow.webContents.executeJavaScript(`
  //   let path = require('path');
  //   module.paths.push(path.resolve(__dirname, '..','..','..','..','..','..'));
  //   path = undefined;
  // `)

  // mainWindow.webContents.openDevTools()

  // // Emitted when the window is closed.
  // mainWindow.on('closed', function () {
  //   mainWindow = null
  // })
  
  // main
  // const {ipcMain} = require('electron')
  // ipcMain.on("asynchronous-message", (event,arg) => {
  //   console.log(arg)
  //   event.sender.send('asynchronous-reply', 'pong')
  // })
  
  // ipcMain.on('synchronous-message', (event, arg) => {
  //   console.log(arg)
  //   event.returnValue = 'pong'
  // })

  require('./menu.js')  
}

function createWindow(){
  mainWindow = new BrowserWindow({width: 1000, height: 600})

  console.log('args', process.argv)
  global.portNumber = process.argv[2]

  
  mainWindow.loadFile("./cover.html")
  // mainWindow.webContents.openDevTools()
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('get-portNum', global.portNumber)
  })
  mainWindow.on('closed', () => mainWindow = null)

  ipcMain.on('load-editor', () => loadEditor() )
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  kill(1234)
  kill(2998)
  kill(3002)
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// require('./file.js')


