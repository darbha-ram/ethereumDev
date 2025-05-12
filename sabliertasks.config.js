/////////////////////////////////////////////////////////////////////////////////////////
// sabliertasks.config.js
//
// This file defines tasks that operate on Sablier Flow streams. All tasks are
// named with prefix "sab_". To use, include in hardhat.config.js _before_ the
// require nomicfoundation line, like so:
//     require("./sabliertasks.config")
//
// Author: Ram Darbha
/////////////////////////////////////////////////////////////////////////////////////////

const { task } = require("hardhat/config");
// const { vars } = require("hardhat/config"); // for vars.get()

// Contract addresses must already be set as Hardhat configuration variables.
// If not set, use "npx hardhat vars set MITCOIN_ADDR" etc.
// See https://hardhat.org/hardhat-runner/docs/guides/configuration-variables.
// const MITCOIN_CONTRACT_ADDR       = vars.get("MITCOIN_CONTRACT_ADDR", ""); // default value
const MITCOIN_CONTRACT_ADDR       = vars.get("MITCOIN_CONTRACT_ADDR");
const MYSABLIERFLOW_CONTRACT_ADDR = vars.get("MYSABLIERFLOW_CONTRACT_ADDR");
const FLOWCREATOR_CONTRACT_ADDR   = vars.get("FLOWCREATOR_CONTRACT_ADDR");

/////////////////////////////////////////////////////////////////////////////////////////
//
// Read-only tasks
//
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_status", "Get status of specified Sablier Flow stream")
    .addParam("streamid", "Id of the stream to query")
    .setAction(async (taskArgs) => {
        console.log("Retrieving status of stream: ", taskArgs.streamid);

        // connect to ISablierFlow contract
        const flowFact = await ethers.getContractFactory("MySablierFlow");
        const flowCon = await flowFact.attach(MYSABLIERFLOW_CONTRACT_ADDR);
    
        const retval = await flowCon.statusOf(taskArgs.streamid);
        console.log("Stream status: ", retval);

        // connect to FlowStreamCreator contract
        const creatorFact = await ethers.getContractFactory("FlowStreamCreator");
        const creatorCon = await creatorFact.attach(FLOWCREATOR_CONTRACT_ADDR);

        const recvr = await creatorCon.receivers(taskArgs.streamid);
        console.log("Receiver of stream: ", recvr);
    });

/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_last", "Get last stream created and its receiver")
    .setAction(async (taskArgs) => {
        console.log("Retrieving last stream");

        // connect to FlowStreamCreator contract
        const creatorFact = await ethers.getContractFactory("FlowStreamCreator");
        const creatorCon = await creatorFact.attach(FLOWCREATOR_CONTRACT_ADDR);

        const lastId = await creatorCon.lastStreamId();
        console.log("Last stream Id: ", lastId);
        if (lastId > 0) {
            const recvrOfLast = await creatorCon.receivers(lastId);
            console.log("    Receiver of last stream: ", recvrOfLast);
        }
        else {
            console.log("    Last Id is empty, has no receiver");
        }

    });


/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_totalDebt", "Get total debt of specified Sablier Flow stream")
    .addParam("streamid", "Id of the stream to query")
    .setAction(async (taskArgs) => {
        console.log("Retrieving total debt of stream: ", taskArgs.streamid);

        // connect to ISablierFlow contract already deployed
        const flowFact = await ethers.getContractFactory("MySablierFlow");
        const flowCon = await flowFact.attach(MYSABLIERFLOW_CONTRACT_ADDR);
    
        const retval = await flowCon.totalDebtOf(taskArgs.streamid);
        console.log("Stream total debt: ", retval);
    });

/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_uncoveredDebt", "Get uncovered debt of specified Sablier Flow stream")
    .addParam("streamid", "Id of the stream to query")
    .setAction(async (taskArgs) => {
        console.log("Retrieving uncovered debt of stream: ", taskArgs.streamid);

        // connect to ISablierFlow contract already deployed
        const flowFact = await ethers.getContractFactory("MySablierFlow");
        const flowCon = await flowFact.attach(MYSABLIERFLOW_CONTRACT_ADDR);
    
        const retval = await flowCon.uncoveredDebtOf(taskArgs.streamid);
        console.log("Stream uncovered debt: ", retval);
    });

/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_coveredDebt", "Get covered debt of specified Sablier Flow stream")
.addParam("streamid", "Id of the stream to query")
.setAction(async (taskArgs) => {
    console.log("Retrieving covered debt of stream: ", taskArgs.streamid);

    // connect to ISablierFlow contract already deployed
    const flowFact = await ethers.getContractFactory("MySablierFlow");
    const flowCon = await flowFact.attach(MYSABLIERFLOW_CONTRACT_ADDR);

    const retval = await flowCon.coveredDebtOf(taskArgs.streamid);
    console.log("Stream covered debt: ", retval);
});



/////////////////////////////////////////////////////////////////////////////////////////
//
// Write tasks
//
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_createStream", "Create a new Sablier Flow stream")
    .addParam("receiver", "Address of receiver")
    .setAction(async (taskArgs) => {
        console.log("sab_createStream");

        // connect to FlowStreamCreator contract already deployed
        const creatorFact = await ethers.getContractFactory("FlowStreamCreator");
        const creatorCon = await creatorFact.attach(FLOWCREATOR_CONTRACT_ADDR);
        //console.log("Creator contract attached. Calling createFlowStream()..");

        const tx = await creatorCon.createFlowStream(taskArgs.receiver, {gasLimit: 29888000});
        const receipt = await tx.wait();

        // TBD if can retrieve stream Id from an event. Normally, receipt.logs
        // is an array where each item is a "Log" or "EventLog".
        // Localhost: receipt.logs only has 3 Log items, no EventLog --> bad.
        // Parsec: receipt.logs is empty -> bad.
        // https://stackoverflow.com/questions/77973577/how-to-get-arguments-from-an-emitted-event-in-hardhat
        // Also https://github.com/ethers-io/ethers.js/discussions/4484
        // Also see events 
        console.log("New flow stream create request submitted.");
        //console.log("  Tx receipt = ", receipt);
        console.log("  Tx status (1 is success) = ", receipt.status);

        // get streamdId just created from member data of contract
        const lastId = await creatorCon.lastStreamId();
        console.log("Last streamd Id: ", lastId);
        const lastReceiver = await creatorCon.receivers(lastId);
        console.log("Last receiver  : ", lastReceiver);

});




