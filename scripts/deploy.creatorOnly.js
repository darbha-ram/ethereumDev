const { getContractFactory } = require("@nomicfoundation/hardhat-ethers/types");
const { ethers } = require("hardhat");
const { vars } = require("hardhat/config");

// Contract addresses from Hardhat config vars, see sethardhatvars.sh, setparsecvars.sh
const MITCOIN_CONTRACT_ADDR       = vars.get("MITCOIN_CONTRACT_ADDR");
const MYSABLIERFLOW_CONTRACT_ADDR = vars.get("MYSABLIERFLOW_CONTRACT_ADDR");

//
// deploy.creatorOnly.js
// Normally FlowStreamCreator contract is deployed as the last of 4 contracts
// in deploy.flow.js. This script allows reusing other 3, deploying only 1.
//

async function main() {
    const sigs = await ethers.getSigners();
    const mysig = sigs[0].address;
    console.log("--> Deploying FlowStreamCreator with signer0: ", mysig);

    const creatorcon = await ethers.deployContract("FlowStreamCreator",
        [MYSABLIERFLOW_CONTRACT_ADDR, MITCOIN_CONTRACT_ADDR],
        {gasLimit: 1210000});
    const creatoraddr = await creatorcon.getAddress();
    console.log("-------------------------------------------------------------------");
    console.log("FlowStreamCreator contract:", creatoraddr);
    console.log("--> ver: ", await creatorcon.myver());
    console.log("-------------------------------------------------------------------");

}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});

