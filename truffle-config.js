const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545,
      network_id: 1337,
      chain_id: 1337,
      host: "0.0.0.0",
    },
  },
  compilers: {
    solc: {
      version: "0.6.12",
    },
  },
};
