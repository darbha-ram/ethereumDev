# Hardhat project for prototyping Solidity EVM smart contracts

Solidity contracts and associated Javascript files for prototyping EVM use cases. 


## Sablier
To deploy Sablier Flow contracts on OpenCBDC PArSEC using Hardhat.



## Hardhat configs
* `hardhat.config.empty.js` - the default config created when a Hardhat project is initialized
* `hardhat.config.opencbdc.js` - the config provided in opencbdc repo, with some changes of mine
* `hardhat.config.js` - this is what Hardhat uses, so in most cases copy over the 'opencbdc' version to this.


## TODO (Hardhat tests and ignition module not used.)
Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
