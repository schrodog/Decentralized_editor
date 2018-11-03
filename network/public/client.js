// let user = 0;

const user_count = document.getElementById("user_count") 

const socket = io('http://localhost:3000')
socket.on('news', data => {
  console.log(data)
  socket.emit('my other event', {
    my: 'data' + Math.round(Math.random()*100)
  })
  // socket.emit('init_count')
})

const fir = document.querySelector("input[name='first']")

document.getElementById("form").onsubmit = evt => {
  evt.preventDefault()
  socket.emit('secret_event', {fd: fir.value})
  fir.value = ''
}

document.getElementById("count").onclick = evt => {
  socket.emit('init_count', {})
}

socket.on('start_count', () => {
  // user = 0
  console.log('start_count')
  socket.emit('vote', {})
})

socket.on('get_count', data => {
  // user++;
  user_count.textContent = data.user;
  console.log('user:', data.user)
})

socket.on('disconnect', () => {
  socket.emit('report_disconnect')
})


