/////////////////////////////////////////////////////////////////////////////////////////
// sabliertasks.config.js
//
// This file defines tasks that operate on Sablier Flow streams. All tasks are
// named with prefix "sab_" to separate them from Hardhat tasks or other user-
// defined ones.
//
// To use, include at the top of hardhat.config.js, _before_ the require
// nomicfoundation line, like so: require("./sabliertasks.config")
//
/////////////////////////////////////////////////////////////////////////////////////////

const { task } = require("hardhat/config");
// const { vars } = = require("hardhat/config"); // for vars.get()

//
// Hardhat configuration variables needed by this file:
// If not set, use "npx hardhat vars set MITCOIN_ADDR" etc.
// See https://hardhat.org/hardhat-runner/docs/guides/configuration-variables.
//
//const MITCOIN_CONTRACT_ADDR       = vars.get("MITCOIN_CONTRACT_ADDR");
const MYSABLIERFLOW_CONTRACT_ADDR = vars.get("MYSABLIERFLOW_CONTRACT_ADDR");
const FLOWCREATOR_CONTRACT_ADDR   = vars.get("FLOWCREATOR_CONTRACT_ADDR");


task("sab_status", "Get status of specified Sablier Flow stream")
    .addParam("streamid", "Id of the stream to find the status of")
    .setAction(async (taskArgs) => {
        console.log("sab_status for stream: ", taskArgs.streamid);

        // connect to ISablierFlow contract already deployed
        const flowFact = await ethers.getContractFactory("MySablierFlow");
        const flowCon = await flowFact.attach(MYSABLIERFLOW_CONTRACT_ADDR);
        //console.log("Flow contract attached. Calling statusOf()..");
    
        const mystat = await flowCon.statusOf(taskArgs.streamid);
        console.log("Stream status: ", mystat);
    });

task("sab_createStream", "Create a new Sablier Flow stream")
    .setAction(async () => {
    console.log("sab_createStream");

    // connect to FlowStreamCreator contract already deployed
    const creatorFact = await ethers.getContractFactory("FlowStreamCreator");
    const creatorCon = await creatorFact.attach(FLOWCREATOR_CONTRACT_ADDR);
    //console.log("Creator contract attached. Calling createFlowStream()..");

    const tx = await creatorCon.createFlowStream({gasLimit: 29888000});
    const receipt = await tx.wait()

    // TBD if it's possible to get the stream Id from an event. Normally, receipt.logs
    // is an array where each item is a "Log" or "EventLog".
    // Localhost: receipt.logs only has 3 Log items, no EventLog --> bad.
    // Parsec: receipt.logs is empty -> bad.
    // https://stackoverflow.com/questions/77973577/how-to-get-arguments-from-an-emitted-event-in-hardhat
    // Also https://github.com/ethers-io/ethers.js/discussions/4484
    // ALso see events 
    console.log("New flow stream create request submitted.");
    console.log("  Tx status  = ", receipt.status);
    console.log("  Tx receipt = ", receipt);

});
