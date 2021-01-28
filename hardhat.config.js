require("@nomiclabs/hardhat-waffle");
require('hardhat-contract-sizer');
const { INFURA_PROJECT_ID, RINKEBY_PRIVATE_KEY } = require("./secrets");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  networks: {
    hardhat: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${RINKEBY_PRIVATE_KEY}`],
    },
  },
  paths: {
    artifacts: "./client/src/artifacts",
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  }
};
