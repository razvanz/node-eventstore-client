module.exports = {
  mode: "none",
  entry: "./src/client.js",
  target: "node",
  output: {
    path: process.env.PWD + "/lib",
    filename: "dist.js",
    libraryTarget: "commonjs2"
  },
  externals: [
    /^[^\.]/,
    {
      "../messages/clientMessage": "../src/messages/clientMessage"
    }
  ]
};
