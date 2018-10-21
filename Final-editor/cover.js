const {ipcRenderer} = require('electron')
const {spawn} = require('child_process')

global.str = []

const loadEditor = () => {
  
  const bat = spawn('yarn run dev 2998', [], {shell: true})
  bat.stderr.on('data', err => {
    const str = new TextDecoder("utf-8").decode(err)
    console.error('cover.js[8]', str)
  })

  bat.stdout.on('data', data => {
    const str = new TextDecoder("utf-8").decode(data)
    console.log('16-stdout: ', str)
    // console.log(str+'')
    global.str.push(str)

    if ((str.substr(0,4)) == 'DONE'){
      console.log('bingoo')
      ipcRenderer.send('load-editor');
    }
  })
  
  console.log('cover.js[12]')
}

// fixPath()

document.getElementById("init").onclick = () => {
  // start websocket server
  const bat = spawn('node ./server/websocket_server.js', [], {shell: true})
  // console.log(process.cwd());
  // const bat = spawn('ls', [], {shell: true})

  bat.stderr.on('data', err => {
    const str = new TextDecoder("utf-8").decode(err)
    console.error('cover.js[18]', str)
  })
  
  bat.stdout.on('data', data => {
    const str = new TextDecoder("utf-8").decode(data)
    console.log('39-stdout: ', str)
  })

  console.log('cover.js[22]')
  loadEditor()
}

document.getElementById("peer").onclick = () => {
  const ip = window.prompt("Enter IP address of peer to connect", "")

  if (ip === null || ip === "") {
  } else {
    window.serverIP = ip
    loadEditor()
  }

}




