// renderer process
const {ipcRenderer} = require('electron')
const fs = require('fs')

const textarea = document.getElementById("text")

console.log(ipcRenderer.sendSync('synchronous-message', 'ping'));

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log('async-reply',arg);
})
ipcRenderer.send('asynchronous-message', 'ping')

ipcRenderer.on('copy-to-textarea', (event, arg) => {
  // console.log('arg',arg)
  // console.log(window)
  // console.log(document)
  window.currentFile = arg.filename;
  console.log('renderer.js[17]',window.currentFile)
  textarea.value = arg.data;
})

textarea.addEventListener("change", (event) => {
  console.log('changed');
  fs.writeFile(window.currentFile, textarea.value, err => {
    if(err) throw err;
    console.log(textarea.value)
    console.log('file is saved')
  })

})









