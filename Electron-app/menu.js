// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// const File = require('./file.js')
const fs = require('fs')
const {dialog, Menu, ipcRenderer} = require('electron')

const template = [
  {
    label: 'File',
    submenu: [
      {role: 'open_folder', 
       label: 'Open Folder',
       accelerator: 'CommandOrControl+O',
       click(menuItem, win, event) {
        //  {properties: ['openFile', 'openDirectory']},
        dialog.showOpenDialog( (filePaths) => {
          console.log(filePaths);
          fs.readFile(filePaths[0], 'utf8', (err, data) => {
            if (err) throw err;
            console.log('file.js[10]')
            win.webContents.send('copy-to-textarea', data)

            // win.loadUrl(`file://${__dirname}/index.html`)
            // win.webContents.once('dom-ready', () => {
            //   console.log('file.js[25]');
            //   win.webContents.executeJavaScript(`document.getElementById("text").textContent = 'fffffffff';`)
            // })
            // ipcMain.on('copy-to-textarea', (event, arg) => {
            //   console.log('file.js[11]', data);
            //   event.sender.send('copy-to-textarea', data)
            // })
          })
        //  File.copy(filePaths[0])
        })
      }
    },
      {role: 'Quit'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'zoomin'},
      {role: 'zoomout'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click() { require('electron').shell.openExternal('https://electronjs.org') }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)















