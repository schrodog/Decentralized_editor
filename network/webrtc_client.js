let localConnection, remoteConnection
let sendChannel, receiveChannel
const dataChannelSend = document.querySelector('textarea#dataChannelSend');
const dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
const startButton = document.querySelector('button#startButton');
const sendButton = document.querySelector('button#sendButton');
const closeButton = document.querySelector('button#closeButton');

const getOtherPc = pc => pc===localConnection ? remoteConnection : localConnection

const getName = pc => pc === localConnection ? 'localPeerConnection' : 'remotePeerConnection'

const onIceCandidate = (conn, e) => {
  console.log('onicecan', e.candidate);
  getOtherPc(conn)
    .addIceCandidate(e.candidate)
    .then(
      () => console.log('add candid success'),
      err => console.log('failed to add', err)
    )
  console.log(`${getName(conn)}`);
}

const onSendChannelStateChange = () => {
  if (sendChannel.readyState === 'open') {
    dataChannelSend.focus()
  }
}

const receiveChannelCallback = event => {
  receiveChannel = event.channel
  receiveChannel.onmessage = evt => {
    dataChannelReceive.value = evt.data
  }
  receiveChannel.onopen = onSendChannelStateChange
  receiveChannel.onclose = () => console.log('ready state',receiveChannel.readyState);
}

const gotDescription2 = desc => {
  // run remote 
  remoteConnection.setLocalDescription(desc)
  // run local after receiving msg
  localConnection.setRemoteDescription(desc)
}

const gotDescription = desc => {
  localConnection.setLocalDescription(desc)
  // run remote
  remoteConnection.setRemoteDescription(desc)

  // run remote
  remoteConnection.createAnswer().then(
    gotDescription2,
    err => console.log('failed to create description', err)
  )
}

const createConnection = () => {
  const servers = null
  localConnection = new RTCPeerConnection(servers)
  sendChannel = localConnection.createDataChannel('send_data')

  localConnection.onicecandidate = e => onIceCandidate(localConnection,e)

  sendChannel.onopen = onSendChannelStateChange
  sendChannel.onclose = onSendChannelStateChange

  // run remote
  remoteConnection = new RTCPeerConnection(servers)  
  remoteConnection.onicecandidate = e => onIceCandidate(remoteConnection, e)
  remoteConnection.ondatachannel = receiveChannelCallback

  localConnection.createOffer().then(
    gotDescription,
    err => console.log('failed to create description', err)
  )

}

const sendData = () => {
  const data = dataChannelSend.value
  sendChannel.send(data)
  console.log('data sent', data)
}

const closeDataChannels = () => {
  sendChannel.close()
  receiveChannel.close()
}

startButton.onclick = createConnection
sendButton.onclick = sendData
closeButton.onclick = closeDataChannels



