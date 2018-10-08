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

  
  window.yAce = y

  console.log('index.js[33]',y);
  
  // bind the textarea to a shared text element
  const editor = ace.edit('aceContainer')
  editor.setTheme('ace/theme/chrome')
  editor.getSession().setMode('ace/mode/javascript')
  

  console.log(editor);

  y.share.text.bindAce(editor, {'aceClass': {'require': ace}})
}).catch(err => alert(err))




