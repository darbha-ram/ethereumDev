const { getContractFactory } = require("@nomicfoundation/hardhat-ethers/types");
const { ethers } = require("hardhat");


//
// Steps to a deploy contracts needed to use Sablier Flow
// - deployment order is important: FlowNFTDesc before Flow, since its address
//       is needed as arg in Flow constructor; MITCoin next, then StreamCreator
//       last as it uses Flow and MITCoin addresses in its constructor.
// - deployContract() is a single call, is preferable. Alternate is 2 calls, shown
//       commented out, getContractFactory() followed by deploy().
// - OpenCBDC sample deploy.js calls deployContract() without specifying gasLimit.
//       This throws runtime exception, so added gasLimit param as below.
// - The myver() APIs are a simple way to ensure that contracts already installed
//       are the expected date/time versions (and the expected contracts!).
//
// - In normal use, deploy.flow.js should be executed _once_, and contract addresses saved.
//      Thereafer, the flow operations (create, deposit, withdraw ..) can be done
//      by operating on the StreamCreator and Flow contracts.
//

async function main() {
    const sigs = await ethers.getSigners();
    const mysig = await sigs[0].address;
    const recvr = await sigs[1].address;

    console.log("--> Deploying with signer0: ", mysig);
    console.log("--> Flow stream receiver is signer1: ", recvr, '\n');

    //
    // MITCoin - this is ERC20 currency for the Sablier Flow stream
    //
    console.log("--> Deploying MITCoin ...");
    const mitcoincon = await ethers.deployContract("MITCoin", [], {gasLimit: 29888000});
    const mitcoinaddr = await mitcoincon.getAddress();
    console.log("-------------------------------------------------------------------");
    console.log("MITCoin address:", mitcoinaddr);
    console.log("-------------------------------------------------------------------\n");

    //
    // MyFlowNFTDesc - needed to instantiate SablierFlow contract, so deploy this first
    //
    console.log("--> Deploying MyFlowNFTDesc ...");
    const nftdesccon = await ethers.deployContract("MyFlowNFTDesc", {gasLimit: 29888000});
    const nftdescaddr = await nftdesccon.getAddress();
    console.log("-------------------------------------------------------------------");
    console.log("MyFlowNFTDesc contract:", nftdescaddr);
    console.log("--> ver: ", await nftdesccon.myver());
    console.log("-------------------------------------------------------------------\n");
    
    //
    // MySablierFlow
    //
    
    console.log("Deploying MySablierFLow ...");
    //const flowfact = await ethers.getContractFactory("MySablierFlow");
    //console.log("--> Got factory MySablier. Calling deploy() ...");
    //const flowcont = await flowfact.deploy([, nftdescaddr], {gasLimit: 29888000});
    const flowcon = await ethers.deployContract("MySablierFlow", [mysig, nftdescaddr],
        {gasLimit: 29888000});
    const flowaddr = await flowcon.getAddress();
    console.log("-------------------------------------------------------------------");
    console.log("MySablierFLow contract:", flowaddr);
    console.log("--> ver: ", await flowcon.myver());
    console.log("-------------------------------------------------------------------");

    //
    // FlowStreamCreator
    //
    console.log("Deploying FlowStreamCreator ...");
    const creatorcon = await ethers.deployContract("FlowStreamCreator", [flowaddr, mitcoinaddr],
        {gasLimit: 29888000});
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

