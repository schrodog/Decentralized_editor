// import {loadWorkspace} from './tree_navigation.js'

ace.define(function(require, exports, module) {
  "use strict";

  const fileDrop = require("./file_drop")
  
  const env = {}
  
  const workerModule = require('ace/worker/worker_client')
  const theme = require('ace/theme/textmate')
  workerModule.WorkerClient = workerModule.UIWorkerClient
  
  const container = document.getElementById("editor-container")
  const Split = require("ace/split").Split
  let initEditor = 2
  const split = new Split(container, theme, initEditor)
  split.setOrientation(0)

  // register file dropping for all editor
  for (let i = 0; i < initEditor; i++)
    fileDrop(split.getEditor(i))
  
  split.on("focus", editor => {
    console.log('custom.js[16]','focused')
    env.editor = editor
  })
  
  env.split = split
  window.env = env
  
  const consoleHeight = 20
  const onResize = () => {
    const left = env.split.$container.offsetLeft
    container.style.cssText 
      = `width: ${document.documentElement.clientWidth - left}px; 
         height: ${document.documentElement.clientHeight - consoleHeight}px; 
         display: flex; flex-direction: column;`
    env.split.resize()
  }
  
  window.onresize = onResize;
  onResize()
  
})


// document.getElementById("add").addEventListener("click", () => {
//   // const editor = split.$createEditor()
//   split.setSplits(++initEditor)
//   fileDrop(split.getEditor(initEditor-1))
//   // initEditor++;
// })

// document.getElementById("remove").addEventListener("click", () => {
//   // split.setSplits(--initEditor)
//   split.removeSelectedEditor()
//   initEditor--;
// })

// document.getElementById("toggle_orientation").addEventListener("click", () => {
//   if(env.split.$orientation === 1){
//     env.split.$orientation = 0;
//   } else {
//     env.split.$orientation = 1;
//   }
//   env.split.resize()
// })

// document.getElementById("load_workspace").addEventListener("click", () => {
//   loadWorkspace(path)
// })
























