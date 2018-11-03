const express = require('express')
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/websocket.html');
});

app.use(express.static('./public'))

let user = 0

io.on('connection', (socket) => {
  user++;
  socket.emit('news', {hello: 'world'});
  socket.broadcast.emit('get_count', {user: user})
  socket.emit('get_count', {user: user})
  
  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('secret_event', data => console.log('secret', data))

  const init_count = () => {
    user = 0;
    console.log('init_count')
    socket.broadcast.emit('start_count')
    socket.emit('start_count')
  }

  socket.on('init_count', init_count)

  socket.on('vote', () => {
    console.log('vote')
    user++;
    socket.broadcast.emit('get_count', {user: user})
    socket.emit('get_count', {user: user})
  })

  socket.on('disconnect', () =>  {
    user--;
    console.log('report discon')
    socket.broadcast.emit('get_count', {user: user})
    // init_count()

  })
});






