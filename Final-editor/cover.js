const {ipcRenderer, remote} = require('electron')
const {spawn} = require('child_process')

ipcRenderer.on('get-portNum', (event,msg) => {
  console.log('start set timeout event', msg);

  const bat = spawn('yarn run dev '+msg, [], {shell: true})
  bat.stderr.on('data', err => {
    const str = new TextDecoder("utf-8").decode(err)
    console.error('cover.js[8]', str)
  })

  bat.stdout.on('data', data => {
    const str = new TextDecoder("utf-8").decode(data)
    console.log('16-stdout: ', str)

    if ((str.substr(0,4)) == 'DONE'){
      console.log('bingoo')
    }
  })
})


const loadEditor = () => {
  
  ipcRenderer.send('load-editor');
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
    let val = document.getElementById("ips").value

    if (!val || !val.toString().match(/\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/g)) {
      console.error("Incorrect ip format.", val);
      return;
    }
    remote.getGlobal('sharedObj').serverIP = val
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




