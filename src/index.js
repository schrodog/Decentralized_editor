import 'babel-polyfill'
import Y from './yjs'
import yArray from './y-array'
import yWebsocketsClient from './y-websockets-client'
import yMemory from './y-memory'
import yMap from './y-map'
import yText from './y-text'
// yWebsocketsClient(Y)
Y.extend(yArray, yWebsocketsClient, yMemory, yArray, yMap, yText)
import * as ace from './brace'
import './brace/mode/javascript'
import './brace/theme/chrome'
import {remote} from 'electron'

// const serverip = location.hostname
window.serverIP = remote.getGlobal('sharedObj').serverIP

const serverip = window.serverIP || location.hostname
console.log('index.js[16]', serverip, window.serverIP)

Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client',
    url: `http://${serverip}:1234`,
    room: 'ace-example'
  },
  sourceDir: 'node_modules',
  share: {
    text0: 'Text',
    text1: 'Text',
    text2: 'Text',
    text3: 'Text',
    text4: 'Text',
    text5: 'Text',
    text6: 'Text',
    text7: 'Text',
    text8: 'Text',
    text9: 'Text',
  }
}).then( y => {
  
  window.yAce = y
  window.aceRef = ace

  console.log('index.js[33]', y);
  
  // bind the textarea to a shared text element
  // const editor = ace.edit('aceContainer')
  // editor.setTheme('ace/theme/chrome')
  // editor.getSession().setMode('ace/mode/javascript')

  const editor = ace.initEditorLayout('aceContainer')

  // console.log(editor);
  // y.share.text.bindAce(editor, {'aceClass': {'require': ace}})
  // window.yAce.share.text.bindAce(editor, {'aceClass': {'require': ace}})

}).catch(err => alert(err))


