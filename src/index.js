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
    // url: 'http://127.0.0.1:1234',
    room: 'ace-example'
  }
}).then( y => {

  console.log(y)
  
  window.yAce = y
  
  // bind the textarea to a shared text element
  const editor = ace.edit('aceContainer')
  editor.setTheme('ace/theme/chrome')
  editor.getSession().setMode('ace/mode/javascript')
  
  // y.define('ace', Y.Text).bindAce(editor)
})




