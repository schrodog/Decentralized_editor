// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const navigation = require('./src/tree_navigation.js')
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
         
        dialog.showOpenDialog(options = {
              properties: ['openFile', 'openDirectory']
            }, (filePaths) => {
          console.log('menu.js[20]',filePaths);
          // navigation.loadWorkspace(filePaths[0])
          // fs.readFile(filePaths[0], 'utf8', (err, data) => {
          //   if (err) throw err;
          //   console.log('file.js[10]')
          win.webContents.send('copy-to-editor', {'dirname': filePaths[0]})
          // })
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
      {role: 'zoomout'},
      {role: 'toggledevtools'}
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















