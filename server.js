const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.prod')
const process = require('process')

// const args = process.argv.slice(2)
const port = parseInt(process.argv[2]) || 3001
console.log('args', process.argv[2])
// console.log('port is', port)

/** file */
const fs = require('fs')
const dirTree = require('directory-tree')

const cors = require('cors')
const express = require('express')
const app = express()
app.use(cors())

let directoryTree = ''

app.get("/filelist", (req, res) => {
  // console.log('req',req.query.path);
  const path = decodeURI(req.query.path)
  console.log('path:', path);
  if (path){
    directoryTree = JSON.stringify(dirTree(path))
    res.send(directoryTree)
  }
  else
    console.log('error');
})

app.get("/dirlist", (req, res) => {
  res.send(directoryTree)
})

app.get("/file", (req, res) => {
  const path = req.query.file
  console.log('static.js[181] file', path);
  fs.readFile(path, (err, data) => {
    if (err) throw err;
    res.send(data.toString())
  })
})

app.listen(3002).on('error', (err) => console.log('server.js[39]', err))



new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  contentBase: __dirname + '/',
}).listen(port, '0.0.0.0', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('DONE')
});


