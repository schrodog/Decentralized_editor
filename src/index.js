import Y from 'yjs'
import yArray from 'y-array'
import yWebsocketsClient from 'y-websockets-client'
import yMemory from 'y-memory'
import yMap from 'y-map'
import yText from 'y-text'
// yWebsocketsClient(Y)
Y.extend(yArray, yWebsocketsClient, yMemory, yArray, yMap, yText)
import * as ace from 'brace'
import 'brace/mode/javascript'
import 'brace/theme/chrome'
import ip from 'ip'
import os from 'os'

// alert('hi')
console.log(ip.address());
console.log(os.networkInterfaces());

Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client',
    url: `http://${location.hostname}:1234`,
    room: 'ace-example'
  },
  sourceDir: 'node_modules',
  share: {
    text: 'Text'
  }
}).then( y => {

  // alert('y')
  
  window.yAce = y
  
  // bind the textarea to a shared text element
  const editor = ace.edit('aceContainer')
  editor.setTheme('ace/theme/chrome')
  editor.getSession().setMode('ace/mode/javascript')
  

  console.log(ace);

  y.share.text.bindAce(editor, {'aceClass': {'require': ace}})
}).catch(err => alert(err))




