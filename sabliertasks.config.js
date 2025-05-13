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
task("sab_status", "Get status of given Sablier Flow stream")
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
task("sab_totalDebt", "Get total debt of given Sablier Flow stream")
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
task("sab_uncoveredDebt", "Get uncovered debt of given Sablier Flow stream")
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
task("sab_coveredDebt", "Get covered debt of given Sablier Flow stream")
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
task("sab_create", "Create a new Sablier Flow stream")
    .addParam("receiver", "Address of receiver")
    .setAction(async (taskArgs) => {
        console.log("sab_create");

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


/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_pause", "Pause the given Sablier Flow stream")
    .addParam("streamid", "Id of the stream to pause")
    .setAction(async (taskArgs) => {
        console.log("Pausing stream: ", taskArgs.streamid);

        const creatorFact = await ethers.getContractFactory("FlowStreamCreator");
        const creatorCon = await creatorFact.attach(FLOWCREATOR_CONTRACT_ADDR);
        const tx = await creatorCon.pauseFlowStream(taskArgs.streamid, {gasLimit: 2888000});

        // Flow.pause() must be invoked by the address set as the stream 'sender' at
        // creation time. To allow this contract to invoke pause, set it's address as the
        // sender above.
        
        const rec = await tx.wait();
        console.log("Tx receipt status: ", rec.status);
});

/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_restart", "Restart the given Sablier Flow stream")
    .addParam("streamid", "Id of the stream to restart")
    .setAction(async (taskArgs) => {
        console.log("Restarting stream: ", taskArgs.streamid);

        // connect to FlowCreator contract - knows RPS and receiver
        const creatorFact = await ethers.getContractFactory("FlowStreamCreator");
        const creatorCon = await creatorFact.attach(FLOWCREATOR_CONTRACT_ADDR);
        const tx = await creatorCon.restartFlowStream(taskArgs.streamid, {gasLimit: 2888000});

        const rec = await tx.wait();
        console.log("Tx receipt status: ", rec.status);
});

/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_deposit", "Deposit into the given Sablier Flow stream")
    .addParam("streamid", "Id of the stream to deposit to")
    .addParam("numcoins", "number of coins to deposit e.g., 5")
    .setAction(async (taskArgs) => {
        console.log("Depositing to stream: ", taskArgs.streamid);

        // connect to FlowCreator contract (knows the hardcoded RPS)
        const creatorFact = await ethers.getContractFactory("FlowStreamCreator");
        const creatorCon = await creatorFact.attach(FLOWCREATOR_CONTRACT_ADDR);

        const tx = await creatorCon.depositFlowStream(taskArgs.streamid, taskArgs.numcoins, {gasLimit: 29888000});
        const rec = await tx.wait();
        console.log("Tx receipt status: ", rec.status);
});

/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_withdraw", "Withdraw from the given Sablier Flow stream")
    .addParam("streamid", "Id of the stream to withdraw from")
    .addParam("numcoins", "number of coins to withdraw e.g., 5")
    .setAction(async (taskArgs) => {
        console.log("Withdrawing from stream: ", taskArgs.streamid);

        // connect to FlowCreator contract (knows the hardcoded RPS)
        const creatorFact = await ethers.getContractFactory("FlowStreamCreator");
        const creatorCon = await creatorFact.attach(FLOWCREATOR_CONTRACT_ADDR);

        const tx = await creatorCon.withdrawFlowStream(taskArgs.streamid, taskArgs.numcoins, {gasLimit: 29888000});
        const rec = await tx.wait();
        console.log("Tx receipt status: ", rec.status);
});


/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_mint", "Mint given #MITCoins to the given address")
    .addParam("receiver", "address to mint coins to")
    .addParam("numcoins", "number of coins to mint e.g., 5")
    .setAction(async (taskArgs) => {
        console.log("Minting coins to: ", taskArgs.receiver);

        // connect to ERC20 contract
        const mitFact = await ethers.getContractFactory("MITCoin");
        const mitCon = await mitFact.attach(MITCOIN_CONTRACT_ADDR);

        const tx = await mitCon.mint(taskArgs.receiver, ethers.parseUnits(taskArgs.numcoins),
            {gasLimit: 29888000});
        const rec = await tx.wait();
        console.log("Tx receipt status: ", rec.status);
});

/////////////////////////////////////////////////////////////////////////////////////////
//
task("sab_balance", "Retrieve balance of given address in #MITCoins")
    .addParam("addr", "address to query balance of")
    .setAction(async (taskArgs) => {
        console.log("Finding balance of: ", taskArgs.addr);

        // connect to ERC20 contract
        const mitFact = await ethers.getContractFactory("MITCoin");
        const mitCon = await mitFact.attach(MITCOIN_CONTRACT_ADDR);

        const tx = await mitCon.balanceOf(taskArgs.addr, {gasLimit: 29888000});
        console.log("Balance (token decimals) : ", tx);
});


