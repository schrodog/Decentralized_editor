const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.prod')

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  contentBase: __dirname + '/',
}).listen(3002, '0.0.0.0', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3001');
});






