# Hardhat project for prototyping Solidity EVM smart contracts

This project contains Solidity contracts and associated Javascript files for prototyping and testing some EVM use cases on OpenCBDC PArSEC and Hardhat local node.

## Before you begin

### Hardhat environment variables
Hardhat variables (called "configuration" variables) are set/get using `npx hardhat vars` command.
The tasks implemented in this project require 3 mandatory variables to be set as vars:
```
MITCOIN_CONTRACT_ADDR
MYSABLIERFLOW_CONTRACT_ADDR
FLOWCREATOR_CONTRACT_ADDR
```
Two scripts are provided to store values of these vars and set them: 
`setparsecvars.sh` for Parsec and `sethardhatvars.sh` for Hardhat localhost network.
The scripts are not mandatory, i.e., vars can be set manually.
Regardless, vars must be set to valid values for the intended target network,
before executing one of the Sablier-related tasks described below aimed at that network.

### Hardhat config files
* `hardhat.config.js` - the top-level configuration Hardhat uses.
   * the compiler optimization block is important, as without it the Sablier family of contracts
     fail compilation due to "too big to deploy" error on Hardhat.
   * check the compiler version, in case Solidity code needs a new version.
   * `allowUnlimitedContractSize` flags were added to address the contracts size error, but
      doesn't seem to help, whether at top level or per-network. Left as is for now.
   * two private keys are specified in the `opencbdc` network config, whose signers
     can be accessed in the Hardhat console like so:
     ```
         sigs = await ethers.getSigners();
         sig0 = sig[0].address;
         sig1 = sig[1].address;
     ```
* `sabliertasks.config.js` - sub-level configuration that is included in the top-level config.
    This contains implementations of all *sab_* tasks I wrote for operating on Sablier streams.


### Deployment scripts
* `deploy.flow.js` - top-level script to deploy 4 required contracts -- the important one!
* `deploy.creatorOnly.js` - convenience script to deploy just the `FlowStreamCreator` contract,
   while reusing addresses of previously deployed 3 contracts. This isn't strictly necessary,
   but is better than deploying all 4 contracts when just `FlowStreamCreator` changes.
   E.g. reusing the `MITCoin` contract allows continuity of balances.
* `deploy.escrow.js` - simple example of how to deploy the `MyEscrow` contract, not needed
   for Sablier flows.
* `deploy.mitcoin.js` - simple example showing alternate to deploy the `MITCoin` ERC20 contract.
 Again, this script is not needed as `deploy.flow.js` is sufficient.


## Setup Hardhat and dependencies
The steps below have been tested on a Ubuntu 22.04 VM.

1. Install Node.js
1. Create new folder for hardhat work and navigate to it: `mkdir playground; cd playground`
1. Install hardhat and associated packages
    * `npm install @nomicfoundation/hardhat-ethers ethers`
    * `npm install hardhat`
    * `npm install @openzeppelin/contracts`
    * `npm install @sablier/flow`
1. Initialize Hardhat project in folder: `npx hardhat init`
1. Backup default files if desired, e.g.,
    * `mv hardhat.config.js hardhat.config.orig.js`
    * `mv package.json package.orig.json`, etc.
1. Clone this repo: `git clone https://github.com/darbha-ram/ethereumDev.git`
1. Run the script `./scripts/sethardhatvars.sh`. This will set the mandatory environment
  vars to some incorrect values. This is ok. At this time, what is important is that
  the vars are set, as they are required by `sabliertasks.config.js` which is included
  in `hardhat.config.js` and no `npx hardhat` command will execute without those vars.

## Setup EVM network
You can deploy a Hardhat "localhost" network (defined in `hardhat.config.js`) like so:
```
$ npx hardhat node
```
You can deploy a different EVM-compatible network, e.g. OpenCBDC, as long as it is
configured in your `hardhat.config.js`. In fact, you can deploy multiple networks at
the same time, and target a specific one when running a  `npm hardhat` command.

To deploy OpenCBDC, follow instructions in the `https://github.com/mit-dci/opencbdc-tx.git` repo.
(At the time of this project, a local instance of PArSEC could be started by running `opencbdc-tx/scripts/parsec-run-local.sh` -- script must have `RUNNER_TYPE="evm"` set.)


## Deploy contracts
Before Sablier related tasks can be executed, the required contracts must be
compiled and deployed on the target network(s) that were deployed above, and
their addresses made available to the scripts.

1. Run script to deploy contracts. Make note of contract addresses displayed.
```
$ cd playground
$ npx hardhat compile
$ npx hardhat run scripts/deploy.flow.js
```
Note, above commands will execute against the network specified as "default" in
`hardhat.config.js`. To run against a different network, say "localhost" use:
`npx hardhat --network localhost run scripts/deploy.flow.js`.  If you are using multiple
target networks (e.g., Hardhat localhost and OpenCBDC PArSEC), the deploy script must be
executed once per network, and addresses saved for each.

2. Assuming the target network is PArSEC, edit `setparsecvars.sh` to update it with the
 contract addresses from the step above. Save and exit. Execute it again to set the config vars
 to correct addresses.
```
$ vi scripts/setparsecvars.sh 
$ ./scripts/setparsecvars.sh
```
If the localhost network was started in step 1, this step must be repeated for it -- save
contract addresses in `sethardhatvars.sh` and execute it. To run against a different network
e.g., Sepolia, feel free to create a new script `setsepoliavars.sh`.

Now you are ready to run hardhat tasks. Run `npx hardhat` for a list of available tasks.
Hardhat native tasks are listed along with the ones implemented in this project prefixed
with `sab_`.
For help on a task e.g. `sab_deposit`, run `npx hardhat help sab_deposit`. 

## Example usage
Now an Ethereum-compatible target network is running, the required contracts have been deployed to it,
and their addresses have been set as Hardhat config vars.

The steps below walk through basic operations on creating, querying and operating Sablier
flows. As noted above, add the `--network` option to run against a non-default network, but make sure
that environment vars have been set for the right network first 
(by executing `npx vars set` or `scripts/setxxxvars.sh`).

1. Check that no stream exists, i.e., the **last stream created** is zero.

```
$ npx hardhat sab_last
```

2. **Create** a new stream. Specify the receiver as your Metamask wallet address,
example below. This is the address to which the stream's withdrawal will go.
Make note of the stream id returned on successful create (e.g. 7) and ensure that a
query for the last stream id returns that value.

```
$ npx hardhat sab_create --receiver 0xD8dfE02d0eD3Ff0E9fc100EdE06244c28d6f3655
$ npx hardhat sab_last  // should return the stream id created above
```

3. Check stream **status**, should be `1n`. Status is an enum
[`Flow.Status`](https://docs.sablier.com/reference/flow/contracts/types/library.Flow),
  1=STREAMING_INSOLVENT, 3=PAUSED_INSOLVENT, etc.
  Also check the **total debt** of stream, should see it increase
on each check, since the stream continuously accumulates debt after creation at
the rate specified (hardcoded to 100 coins/day in our prototype code.)

```
$ npx hardhat sab_status --streamid 7
$ npx hardhat sab_totalDebt --streamid 7
(wait few seconds)
$ npx hardhat sab_totalDebt --streamid 7
```

4. Total debt is the sum of **covered debt** (which the receiver can withdraw if the stream
had funds deposited to cover it) and **uncovered debt** (which cannot be withdrawn until a
deposit is made).
Check them both. Covered debt should be zero for a new stream without deposits. A stream
whose deposits don't cover its total debt is deemed to be "insolvent". Since we created a
stream with zero deposit, it is insolvent soon after creation.

```
$ npx hardhat sab_coveredDebt --streamid 7
$ npx hardhat sab_uncoveredDebt --streamid 7
```

5. **Pause** a stream, check that its debt stops accumulating. Then **restart** it,
  debt should start accumulating again. Check status when paused and restarted - should
  move from PAUSED_INSOLVENT to STREAMING_INSOLVENT.
```
$ npx hardhat sab_pause --streamid 7
$ npx hardhat sab_status --streamid 7     // should be '3n'
$ npx hardhat sab_totalDebt --stream 7
(wait few seconds)
$ npx hardhat sab_totalDebt --stream 7
(the debt should remain unchanged, i.e., not accumulating while paused)

$ npx hardhat sab_restart --streamid 7
$ npx hardhat sab_status --streamid 7     // should be back to '1n'
$ npx hardhat sab_totalDebt --stream 7    // should be accumulating again
```

6. Prepare for deposit/withdraw operations on the stream. First, **mint** 25 coins
to `FlowStreamCreator` contract address (e.g., 0x6A76bC9CC5eF587cc2b6F998f60db606631DE48c).
Also check the ERC20 balance of the receiver address -- run `sab_balance` on command line
or check Metamask UI.

```
$ npx hardhat sab_mint --numcoins 25 --receiver 0x6A76bC9CC5eF587cc2b6F998f60db606631DE48c
$ npx hardhat sab_balance --addr 0x6A76bC9CC5eF587cc2b6F998f60db606631DE48c // verify 25 coins
$ npx hardhat sab_balance --addr 0xD8dfE02d0eD3Ff0E9fc100EdE06244c28d6f3655 // or see Metamask UI
(Make note of Metamask address balance)
```

7. **Deposit** 1 coin to stream. The contract's balance should go down from 25 to 24,
 and the stream's covered debt should now be non-zero. Note, the stream's debt accumulates
 at rate of 100 coins/day or ~1 coin every 14 min. Covered debt should increase till it
 reaches 1 coin (or 1,000,000,000,000,000,000 in token decimals) and then stop. The stream
 status while uncovered debt is zero should be STREAMING_SOLVENT.
```
$ npx hardhat sab_deposit --numcoins 1 --streamid 7
$ npx hardhat sab_coveredDebt --streamid 7 // verify non-zero
$ npx hardhat sab_status --streamid 7
```

8. Do **withdraw** of 1 coin from stream. The receiver address should receive the coin,
even though the withdraw was done by party who is not receiver. (If the receiver themselves
does the withdraw, they can direct the funds to a different address, this is not shown.)

```
$ npx hardhat sab_withdraw --numcoins 1 --streamid 7
$ npx hardhat sab_coveredDebt --streamid 7  // should be zero
$ npx hardhat sab_balance --addr 0xD8dfE02d0eD3Ff0E9fc100EdE06244c28d6f3655
(Balance should be 1 coin more than the value in step 6.)
```

This concludes a quick overview of flow operations. Other operations are supported on flows
but haven't been implemented in this project as tasks,
e.g., `adjustRatePerSecond`, `void`, `refund` -- see 
[`ISablierFlow` interface](https://docs.sablier.com/reference/flow/contracts/interfaces/interface.ISablierFlow) for a full list. To implement, follow the pattern in this project --
a task in `sabliertasks.config.js` that invokes a `FlowStreamCreator` function.

## Note about FlowStreamCreator contract
This implementation assumes that an employer, say, Acme Inc. will create several streams to
pay their employees. Every stream will have the same sender (Acme) but a different receiver
(the employee). We envision that Acme would deploy a contract like `FlowStreamCreator` to
manage the streams of their employees. A different employer can deploy another instance of
`FlowStreamCreator` or write their own creator contract.

`ISablierFlow` requires each stream's sender to be specified, so that subsequent changes to
the stream (`pause`, `restart`, etc.) would be invokable only by that sender. One idea is
for `FlowStreamCreator` to pass `msg.sender` as the stream's sender address (this would be
`signer0.address` if the create operation was invoked by the signer in Hardhat console).
But doing this means operations on the stream would be invokable by that signer only.
It would also add overhead to several tasks (e.g., every
`withdraw` requires specifying the receiver address, every `restart` requires specifying the
rate per second) making them onerous to execute from the console as that information about
streams has to be remembered and reused each time.

Instead, we envision that `FlowStreamCreator` contract could store all its streams' info
(such as receivers and rate) so that its functions have a simple interface. E.g., `withdraw` just
needs streamId and #coins, it looks up the receiver. We set `FlowStreamCreator` contract as
the sender of every stream, to allows its functions to operate on Acme's streams. A production
contract may be setup slightly differently (e.g., each stream's rate could be different),
but nevertheless this model of a single `FlowStreamCreator` per employer is close to a
production usage and allows us to verify functionality of Sablier Flow on OpenCBDC PArSEC.

## TODO (Hardhat tests and ignition module not used.)
No hardhat tests have been written, so use at own risk!

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
