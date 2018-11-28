// renderer process
const {ipcRenderer} = require('electron')
const {dialog} = require('electron').remote
const fs = require('fs')
const path = require('path')
const connector = require('../../../../../../src/yjs/src/Connector.js')

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

const initDirTree = (tree) => {

  const root = new TreeNode(tree.name)
  window.dirTree = tree

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
  console.log('renderer.js[53]', tree);

  iterate_tree(tree, root)

  const view = new TreeView(root, '#file_tree_container')
  view.collapseAllNodes();
  root.setExpanded(true);
  view.reload();
}

ipcRenderer.on('copy-to-editor', (event, arg) => {

  window.currentDirectory = path.resolve(arg.dirname, '..');
  console.log('renderer.js[17]',window.currentDirectory)

  fetch(new Request(`http://localhost:3002/filelist?path=${encodeURI(arg.dirname)}`, myInit))
    .then(res => res.json())
    .then(tree => {
      initDirTree(tree)
    }).catch(err => console.log('[tree_navigation] error', err))
})

document.getElementById("add").addEventListener("click", () => {
  // const editor = split.$createEditor()
  // window.initEditor++
  let splits = window.env.split.$splits
  window.env.split.addEditor()
  let editor = window.env.split.getEditor(splits)
  fileDrop(editor)
  window.yAce.share[`text${splits}`].bindAce(editor, {'aceClass': {'require': window.aceRef}})

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

let syncRoot = '/home/lkit/tmp'

document.getElementById("load_workspace").addEventListener("click", () => {

  dialog.showOpenDialog(options={
    properties: ['openDirectory'],
    title: "Select directory to save shared documents"
  }, (filePath) => {
    if(! filePath) return;

    syncRoot = filePath[0]
    console.log('renderer[107]', syncRoot );
    fetch(new Request(`http://${window.serverIP}:3002/dirlist`, myInit))
      .then(res => res.json())
      .then(tree => {
        document.getElementById("loading-icon").style.display = "initial"
        document.getElementById("aceContainer").style.filter = "brightness(70%)"
  

        const iterate_tree = (parent, extra) => {
          const child = parent.children
          if (parent.type === 'directory'){
            console.log('[105] mkdir');
            fs.mkdir(path.join(syncRoot, extra, parent.name), 0777, (err) => {if(err) throw err})
          } else if (parent.type === 'file'){
            console.log('[108] files');
            fetch(new Request(`http://${window.serverIP}:3002/file?file=${parent.path}`, myInit)).then(res => res.text())
              .then(text => {
                fs.writeFile(path.join(syncRoot, extra, parent.name), text, (err) => {
                  if (err) throw err;
                  console.log('written file', parent.name);
                })
              })
          }
          if (child) {
            for (let i in child)
              iterate_tree(child[i], path.join(extra, parent.name) )
          }
        }
  
        console.log('renderer.js[123]',tree);
  
        fs.exists(path.join(syncRoot, tree.name), (exists) => {
          if (exists){
            console.log('file already exists!');
            return
          }
          if (tree)
            iterate_tree(tree, '')
        })
  
        initDirTree(tree)
        window.currentDirectory = syncRoot

        document.getElementById("loading-icon").style.display = "none"
        document.getElementById("aceContainer").style.filter = "brightness(100%)"


  
      })
  })


})


// textarea.addEventListener("change", (event) => {
//   console.log('changed');
//   fs.writeFile(window.currentFile, textarea.value, err => {
//     if(err) throw err;
//     console.log(textarea.value)
//     console.log('file is saved')
//   })

// })









