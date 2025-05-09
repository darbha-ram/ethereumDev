# Hardhat project for prototyping Solidity EVM smart contracts

Solidity contracts and associated Javascript files for prototyping EVM use cases. 

## Steps
### Setup
1. Install Node.js
1. Install hardhat and associated packages
    * `npm install @nomicfoundation/hardhat-ethers ethers`
    * `npm install hardhat`
    * `npm install @openzeppelin/contracts`
    * `npm install @sablier/flow`
1. Create new folder to do hardhat work: `mkdir playground; cd playground`
1. Initialize Hardhat project in new folder - `npx hardhat init`
1. Backup any default files, e.g.,
    * `mv hardhat.config.js hardhat.config.orig.js`
    * `mv package.json package.orig.json`, etc.
1. Clone this repo there: `git clone https://github.com/darbha-ram/ethereumDev.git`

### Deployment
1. Run script to deploy contracts. Make note of contract addresses.
1. Update `setparsecvars.sh` or its counterpart (see below) with contract addresses. Run it.
1. Now Hardhat tasks with prefix `sab` can be executed, see `npx hardhat` for a list.

## Hardhat configuration variables
Configuration variables specific to Hardhat are set/get using `npx hardhat vars` command.
Two bash scripts are provided, to allow saving values of variables and setting them.
The main vars needed are contract addresses. Two bash scripts `setparsecvars.sh` for
Parsec network and  `sethardhatvars.sh` for Hardhat localhost network are available.

## Hardhat configs
* `hardhat.config.empty.js` - the default config created when a Hardhat project is initialized
* `hardhat.config.js` - the top-level configuration Hardhat uses
* `sabliertasks.config.js` - definitions of tasks that are included in the top-level configuration


## Deployment & operations scripts
* `deploy.flow.js` - top-level script to deploy 4 required contracts.
* `deploy.escrow.js` - simple example of how to deploy the MyEscrow.sol contract
* `deploy.mitcoin.js` - simple example showing alternate to deploy


## TODO (Hardhat tests and ignition module not used.)
Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
