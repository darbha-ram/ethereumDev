const { getContractFactory } = require("@nomicfoundation/hardhat-ethers/types");
const { ethers } = require("hardhat");

// Contract addresses read from Hardhat config vars, see scripts/sethardhatvars.sh
const MITCOIN_CONTRACT_ADDR       = vars.get("MITCOIN_CONTRACT_ADDR");
const MYSABLIERFLOW_CONTRACT_ADDR = vars.get("MYSABLIERFLOW_CONTRACT_ADDR");

//
// deploy.creatorOnly.js
// This is to deploy the FlowStreamCreator contract only. Normally that contract is
// deployed as the last of 4 contracts in deploy.flow.js, hence this script isn't
// needed. However, if this contract needs to be deployed again by itself, by reusing
// other contracts already deployed, see below.
//

async function main() {
    const sigs = await ethers.getSigners();
    const mysig = sigs[0].address;
    const recvr = sigs[1].address;

    console.log("--> Deploying with signer0: ", mysig);
    console.log("--> Flow stream receiver is signer1: ", recvr, '\n');

    //
    // FlowStreamCreator
    //
    console.log("Deploying FlowStreamCreator ...");
    const creatorcon = await ethers.deployContract("FlowStreamCreator",
        [MYSABLIERFLOW_CONTRACT_ADDR, MITCOIN_CONTRACT_ADDR, recvr],
        {gasLimit: 210000});
    const creatoraddr = await creatorcon.getAddress();
    console.log("-------------------------------------------------------------------");
    console.log("StreamCreator contract:", creatoraddr);
    console.log("--> ver: ", await creatorcon.myver());
    console.log("-------------------------------------------------------------------");

}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});

