module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['es2015','react']
          }
        }
      },
      {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        // loader: "url?limit=10000"
        use: "url-loader"
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader'
      },
      {
        test: /\.(gif)(\?[\s\S]+)?$/,
        use: 'file-loader'
      }
    ]
  },
  externals: {
    "fs":"require('fs')"
  }
};
