const {ipcRenderer} = require('electron')
const {spawn} = require('child_process')
// const smalltalk = require('smalltalk/native')

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

const prompt = document.getElementById("prompt")

document.getElementById("peer").onclick = () => {

  prompt.style.display = "block";
  document.getElementById("ok").onclick = () => {
    const val = input.value;
    if (!val || !val.toString().match(/\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/g)) {
      console.error("Incorrect ip format.");
      return;
    }
    window.serverIP = ip
    loadEditor()
  }
  
  document.getElementById("cancel").onclick = () => {
    prompt.style.display = "none";
  }

  // smalltalk
  //   .prompt("", "Enter IP address of peer to connect", "")
  //   .then(val => {
  //     if (!val || !val.toString().match(/\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/g)) {
  //       reject(new Error("Incorrect ip format."));
  //     }
  //     window.serverIP = ip
  //     loadEditor()
  //   }).catch(() => console.log('cancelled'))

}




