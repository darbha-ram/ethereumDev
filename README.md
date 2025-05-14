# Hardhat project for prototyping Solidity EVM smart contracts

Solidity contracts and associated Javascript files for prototyping EVM use cases. 

## Before you begin

### Hardhat environment variables
Hardhat variables (called "configuration" variables) are set/get using `npx hardhat vars` command.
We set contract addresses as vars, with option to store two sets of values in
`setparsecvars.sh` for Parsec and `sethardhatvars.sh` for Hardhat localhost network.
Their use is not mandatory, however makes it easy to set the 3 mandatory vars 
before executing sablier related tasks described below.

### Hardhat config files
* `hardhat.config.js` - the top-level configuration Hardhat uses.
   * the compiler optimization block is important, without it the sablier contracts
     fail compilation due to "too big to deploy" error on Hardhat.
   * check the compiler version, in case Solidity code needs a new version.
   * `allowUnlimitedContractSize` flag doesn't seem to do anything useful, whether
     at top level or inside each network. Left it there for now.
   * two private keys are specified in the `opencbdc` network config, whose signers
     can be accessed in the Hardhat console like so:
     ```
         sigs = await ethers.getSigners();
         sig0 = sig[0].address;
         sig1 = sig[1].address;
     ```
* `sabliertasks.config.js` - sub-level configuration included in the top-level config.
    It contains definitions of all sab_ tasks I wrote for operating on Sablier streams.


### Deployment scripts
* `deploy.flow.js` - top-level script to deploy 4 required contracts -- the important one!
* `deploy.creatorOnly.js` - convenience script to deploy just the FlowStreamCreator contract,
   while reusing addresses of previously deployed 3 contracts. This isn't strictly necessary,
   but is better than deploying all 4 contracts on a change to just FlowStreamCreator.
   E.g. reusing the MITCoin contract allows continuity of balances.
* `deploy.escrow.js` - simple example of how to deploy the MyEscrow.sol contract, not needed
   for Sablier flows.
* `deploy.mitcoin.js` - simple example showing alternate to deploy ERC20 contract. Again, not
   needed as this contract is deployed in the `deploy.flow.js`.


## Setup
1. Install Node.js
1. Create new folder to do hardhat work: `mkdir playground; cd playground`
1. Install hardhat and associated packages
    * `npm install @nomicfoundation/hardhat-ethers ethers`
    * `npm install hardhat`
    * `npm install @openzeppelin/contracts`
    * `npm install @sablier/flow`
1. Initialize Hardhat project in new folder - `npx hardhat init`
1. Backup any default files, e.g.,
    * `mv hardhat.config.js hardhat.config.orig.js`
    * `mv package.json package.orig.json`, etc.
1. Clone this repo there: `git clone https://github.com/darbha-ram/ethereumDev.git`

## Deploy contracts
1. Run script to deploy contracts. Make note of contract addresses displayed.
```
$ cd playground
$ npx hardhat run scripts/deploy.flow.js
```
Note, above runs against the network that is specified as default in `hardhat.config.js`.
You can run against a non-default network like so: `npx hardhat --network localhost run scripts/deploy.flow.js`. 

2. Edit `setparsecvars.sh` and save new contract addresses. Execute it to set the addresses.
```
$ vi scripts/setparsecvars.sh 
$ ./scripts/setparsecvars.sh
```

Now you are ready to run hardhat tasks. Run `npx hardhat` for a list of tasks with prefix `sab_`.
For help on a task e.g. `sab_deposit`, run `npx hardhat help sab_deposit`. As noted above,
run a task as `npx hardhat [--network <target network>] <sometask>`.

## Example usage

1. Check that the **last stream created** is zero, i.e., no stream exists.

```
$ npx hardhat sab_last
```

2. **Create** a new stream. Specify the receiver as your Metamask wallet address,
example below. This is the address to which the stream's withdrawal will go.
Note the stream id returned on successful create (e.g. 3) and ensure that last
stream id now returns 3.

```
$ npx hardhat sab_create --receiver 0xD8dfE02d0eD3Ff0E9fc100EdE06244c28d6f3655
$ npx hardhat sab_last  // should return the stream id created above
```

3. Check stream **status**, should be `1n`. Status is an enum `Flow.Status` (5 states):
  1=accumulating insolvent, 3: paused insolvent, etc. See Sablier docs online (ref TBD).
  Also check the **total debt** of stream, should see it increase
on each check, since the stream continuously accumulates debt.

```
$ npx hardhat sab_status --streamid 3
$ npx hardhat sab_totalDebt --streamid 3
(wait few seconds)
$ npx hardhat sab_totalDebt --streamid 3
```

4. Total debt is the sum of **covered debt** (which the receiver can withdraw if the stream
has funds to cover it) and **uncovered debt** (which cannot be withdrawn until a deposit is made).
Check them both. Covered debt should be zero for a new stream without deposits.

```
$ npx hardhat sab_coveredDebt --streamid 3
$ npx hardhat sab_uncoveredDebt --streamid 3
```

5. **Pause** a stream, check that its debt stops accumulating. Then **restart** it,
  debt should start accumulating again. Check status when paused and restarted.
```
$ npx hardhat sab_pause --streamid 3
$ npx hardhat sab_status --streamid 3     // should be '3n'
$ npx hardhat sab_totalDebt --stream 3
(wait few seconds)
$ npx hardhat sab_totalDebt --stream 3
(the debt should remain unchanged, i.e., not accumulating while paused)

$ npx hardhat sab_restart --streamid 3
$ npx hardhat sab_status --streamid 3     // should be back to '1n'
$ npx hardhat sab_totalDebt --stream 3    // should be accumulating again
```

6. Prepare for deposit/withdraw operations on the stream. First, **mint** 25 coins
to `FlowStreamCreator` contract address (e.g., 0x6A76bC9CC5eF587cc2b6F998f60db606631DE48c).
Also check the ERC20 balance of the receiver address - can do this either from command line
or the Metamask UI.

```
$ npx hardhat sab_mint --numcoins 25 --receiver 0x6A76bC9CC5eF587cc2b6F998f60db606631DE48c
$ npx hardhat sab_balance --addr 0x6A76bC9CC5eF587cc2b6F998f60db606631DE48c // verify 25 coins

$ npx hardhat sab_balance --addr 0xD8dfE02d0eD3Ff0E9fc100EdE06244c28d6f3655 // or see Metamask UI
```

7. **Deposit** 1 coin to stream. The contract's balance should go down from 25 to 24,
 and the stream's covered debt should now be non-zero. Note, the stream's debt accumulates
 at rate of 100 coins/day or ~1 coin every 14 min. Covered debt should increase till it
 reaches 1 coin (or 1,000,000,000,000,000,000 in token decimals) and then stop.
```
$ npx hardhat sab_deposit --numcoins 1 --streamid 3
$ npx hardhat sab_coveredDebt --streamid 3 // verify non-zero
```

8. Do **withdraw** of 1 coin from stream. The receiver address should receive the coin,
even though the withdraw was done by party who is not receiver.

```
$ npx hardhat sab_withdraw --numcoins 1 --streamid 3
$ npx hardhat sab_coveredDebt --streamid 3  // should be zero
$ npx hardhat sab_balance --addr 0xD8dfE02d0eD3Ff0E9fc100EdE06244c28d6f3655 // should be 1 coin
```

This is a quick overview of operations on flows. Other operations are possible
e.g., `adjustRatePerSecond`, `void`, `refund` -- see `ISablierFlow` interface.
They can be implemented if desired,
by following the same pattern of a task in `sabliertasks.config.js` that invokes
a `FlowStreamCreator` function.

## Note about FlowStreamCreator contract
Ideally, in production, this contract should create the Flow stream, setting the "sender"
of each stream to be a different entity, i.e., the address who sent the original request
(say signer0.address). Subsequent changes to the stream (`pause`, `restart`,
`adjustRatePerSecond` etc.) would be invokable only by that signer, and not
by functions of `FlowStreamCreator`. 

For our needs, to facilitate testing, the above approach would add a lot of overhead e.g., every
`withdraw` requires specifying the receiver address, every `restart` requires specifying the rate per
second, etc. To avoid overhead, we store every stream's receiver and hardcode the rate in the
`FlowStreamCreator` contract, so that its functions have a simple interface e.g., `withdraw` just
needs streamId and #coins, it looks up the receiver. To allow those functions to operate the
stream, we set that contract as the sender of every stream. This is, as noted above, not how
a production contract would be setup, but is suitable for our testing needs.

## TODO (Hardhat tests and ignition module not used.)
No hardhat tests have been written, so use at own risk!

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
