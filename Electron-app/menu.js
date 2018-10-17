// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {Menu} = require('electron')

const template = [
  {
    label: 'File',
    submenu: [
      {role: 'open_folder', 
       label: 'Open Folder',
       accelerator: 'CommandOrControl+O' },
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















