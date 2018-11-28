const {ipcRenderer, remote} = require('electron')
const {spawn} = require('child_process')
const swal = require('sweetalert2')

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

global.userlist = []
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

    let match = 'websocket_server.js[69]'
    if (str.slice(0, match.length) === match){
      // console.log('match bingo!!!!');
      global.userlist.push(JSON.parse(str.slice(match.length)))
    }
  })

  console.log('cover.js[22]')
  loadEditor()
}

document.getElementById("peer").onclick = () => {
  
  (async function getIP(){

    const {value: ipAddr} = await swal({
      input: 'text',
      title: "Input peer's IP",
      inputPlaceholder: "Enter peer's IP address",
      showCancelButton: true
    })
    console.log(ipAddr);
    
    if (!ipAddr || !ipAddr.toString().match(/\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/g)) {
      console.error("Incorrect ip format.", ipAddr);
      swal({
        title: 'Error!',
        type: 'error',
        text: 'Incorrect ip format',
        confirmButtonText: 'Ok'
      })
      return;
    }

    console.log('go');

    remote.getGlobal('sharedObj').serverIP = ipAddr
    loadEditor()
  })()

}




