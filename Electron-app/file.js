// copy to textarea

const fs = require('fs')
const {ipcMain} = require('electron')


exports.copy = function(path){
  fs.readFile(path, 'utf8', (err,data) => {
    if(err) throw err;
    console.log('file.js[10]')
    ipcMain.on('copy-to-textarea', (event,arg) => {
      console.log('file.js[11]', data);
      // event.sender.send('copy-to-textarea', data)
    })
  })
} 

















