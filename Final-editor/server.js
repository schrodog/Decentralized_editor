const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.prod')
const process = require('process')

// const args = process.argv.slice(2)
const port = parseInt(process.argv[2]) || 3001
console.log('args', process.argv[2])
// console.log('port is', port)

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  contentBase: __dirname + '/',
}).listen(port, '0.0.0.0', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3001');
});







