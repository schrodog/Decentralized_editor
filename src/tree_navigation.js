// import {TreeNode, TreeView} from './tree.js'
const fetch = require('node-fetch')
const {TreeNode} = require('./tree.js')
global.Headers = fetch.Headers
global.Request = fetch.Request

const myInit = {
  method: 'GET',
  headers: new Headers({
    'Content-Type': 'application/json;charset=UTF-8'
  }),
  mode: 'cors',
  cache: 'default'
}

const path = '/home/lkit/tmp/purecss-francine'

// console.log(`http://localhost:3001/file?path=${encodeURI(path)}`)

exports.loadWorkspace = (path) => {

  fetch(new Request(`http://localhost:3002/filelist?path=${encodeURI(path)}`, myInit))
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
  
      // const view = new TreeView(root, '#file_tree_container')
      // view.collapseAllNodes();
      // root.setExpanded(true);
      // view.reload();
  
      // function changeIcons(fa_icons) {
      //   if (fa_icons) {
      //     view.changeOption("leaf_icon", '<i class="fas fa-file"></i>');
      //     view.changeOption("parent_icon", '<i class="fas fa-folder"></i>');
  
      //     TreeConfig.open_icon = '<i class="fas fa-angle-down"></i>';
      //     TreeConfig.close_icon = '<i class="fas fa-angle-right"></i>';
      //   } else {
      //     view.changeOption("leaf_icon", undefined);
      //     view.changeOption("parent_icon", undefined);
  
      //     TreeConfig.open_icon = TreeUtil.default_open_icon;
      //     TreeConfig.close_icon = TreeUtil.default_close_icon;
      //   }
  
      //   view.reload();
      // }
  
      // function toggleCustomIcon(n) {
      //   if (n == true) {
      //     root.changeOption("icon", '<i class="fas fa-code-branch"></i>');
      //   } else {
      //     root.changeOption("icon", undefined);
      //   }
  
      //   view.reload();
      // }
  
      // let count = 1;
  
      // document.getElementById("add").onclick = () => {
      //   root.addChild(new TreeNode('' + count++));
      //   view.reload();
      // }
  
      // document.getElementById("remove").onclick = () => {
      // 	if (n2.isLeaf()) return;
      // 	n2.removeChild(n2.getChildren()[n2.getChildCount() - 1]);
      // 	count--;
      // 	view.reload();
      // }
  
      // document.getElementById("expand").onclick = () => {
      //   view.expandAllNodes();
      //   view.reload();
      // }
  
      // document.getElementById("collapse").onclick = () => {
      //   view.collapseAllNodes();
      //   view.reload();
      // }
  
      // only show first layer
      
  
    }).catch(err => console.log('[tree_navigation] error', err))
}

// loadWorkspace(path)






