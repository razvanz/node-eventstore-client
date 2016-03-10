module.exports = {
  entry: "./src/client.js",
  target: "node",
  output: {
    filename: "./lib/dist.js",
    libraryTarget: "commonjs2"
  },
  externals: [
    /^[^\.]/,
    {
      "../messages/clientMessage": "../src/messages/clientMessage"
    }
  ]
};