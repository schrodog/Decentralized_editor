// renderer process
const {ipcRenderer} = require('electron')
console.log(ipcRenderer.sendSync('synchronous-message', 'ping'));

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log('async-reply',arg);
})
ipcRenderer.send('asynchronous-message', 'ping')

ipcRenderer.on('copy-to-textarea', (event, arg) => {
  // console.log('arg',arg)
  // console.log(window)
  // console.log(document)
  document.getElementById("text").textContent = arg;
})

