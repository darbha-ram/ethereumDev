require("./sabliertasks.config")
require("@nomicfoundation/hardhat-ethers");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

//
// Ramd: this is a copy of opencbdc-tx/scripts/hardhat.config.js, with a few changes:
// 1. compiler version changed from "0.8.17" to "0.8.24", to allow newer Solidity code compilation
// 2. added "hardhat" and "localhost" networks, to allow EVM testing locally in Hardhat
// 3. added 2nd account in 'opencbdc' network for contracts where 2 signers are needed, e.g., escrow.
// 4. sabliertasks.config.js is included _before_ the customary include of hardhat-ethers
//


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        // RamD: change from 0.8.17, to permit compilation of newer solidity code. Enable
        //     optimization to decrease size of compiled contracts, since SablierFlow
        //     runs into error about too big to deploy.
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },

      },
    ],
  },
  allowUnlimitedContractSize: true,

  defaultNetwork: "opencbdc",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,          // TBD - doesn't do anything?
    },                                           // local testing
    localhost: {
      url:"http://127.0.0.1:8545",               // local hardhat node
      allowUnlimitedContractSize: true,
    },
    opencbdc: {
      // This URL is the PArSEC agent Node endpoint
      // NOTE: "localhost" (instead of 127.0.0.1) may work on some systems
      url: "http://127.0.0.1:8888/",

      // RamD: TBD this is not same as gasLimit arg in deployContract() & other calls..
      //blockGasLimit: 100000,

      // Private key corresponding to a pre-minted PArSEC account
      // RamD: add 2nd key for use with Escrow & other contracts needing 2 or more signers
      accounts: ["32a49a8408806e7a2862bca482c7aabd27e846f673edc8fb0000000000000000", "be2f701456a4254d517a8898c3ab9c56ddecee892b418c3b1be384d405d155b4"]
    }
  }
};

