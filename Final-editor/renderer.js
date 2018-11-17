// renderer process
const {ipcRenderer} = require('electron')
const fs = require('fs')
const path = require('path')

// module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', '..', '..'));
console.log('module.paths', __dirname)
const fileDrop = require('../../../../../../src/brace/file_drop.js')
const {TreeNode, TreeView} = require('../../../../../../src/tree.js')

console.log('TreeView', fileDrop)

// console.log(ipcRenderer.sendSync('synchronous-message', 'ping'));

// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log('async-reply',arg);
// })
// ipcRenderer.send('asynchronous-message', 'ping')

const myInit = {
  method: 'GET',
  headers: new Headers({
    'Content-Type': 'application/json;charset=UTF-8'
  }),
  mode: 'cors',
  cache: 'default'
}


ipcRenderer.on('copy-to-editor', (event, arg) => {

  window.currentDirectory = path.resolve(arg.dirname, '..');
  console.log('renderer.js[17]',window.currentDirectory)

  fetch(new Request(`http://localhost:3002/filelist?path=${encodeURI(arg.dirname)}`, myInit))
    .then(res => res.json())
    .then(tree => {

      const root = new TreeNode(tree.name)

      const iterate_tree = (parent, parentNode) => {
        const child = parent.children
        if (child) {
          for (let i in child) {
            const node = new TreeNode(child[i].name)
            parentNode.addChild(node)
            if (child[i].children)
              iterate_tree(child[i], node)
          }
        }
      }

      iterate_tree(tree, root)

      const view = new TreeView(root, '#file_tree_container')
      view.collapseAllNodes();
      root.setExpanded(true);
      view.reload();

    }).catch(err => console.log('[tree_navigation] error', err))

})

document.getElementById("add").addEventListener("click", () => {
  // const editor = split.$createEditor()
  window.initEditor++
  window.env.split.addEditor()
  fileDrop(window.env.split.getEditor(window.initEditor - 1))
  // initEditor++;
})

document.getElementById("remove").addEventListener("click", () => {
  // split.setSplits(--initEditor)
  window.env.split.removeSelectedEditor()
  window.initEditor--;
})

document.getElementById("toggle_orientation").addEventListener("click", () => {
  if (env.split.$orientation === 1) {
    window.env.split.$orientation = 0;
  } else {
    window.env.split.$orientation = 1;
  }
  window.env.split.resize()
})

// document.getElementById("load_workspace").addEventListener("click", () => {
//   loadWorkspace(path)
// })


// textarea.addEventListener("change", (event) => {
//   console.log('changed');
//   fs.writeFile(window.currentFile, textarea.value, err => {
//     if(err) throw err;
//     console.log(textarea.value)
//     console.log('file is saved')
//   })

// })









