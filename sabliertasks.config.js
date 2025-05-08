
const { task } = require("hardhat/config");

//
// This file should be included at the top of hardhat.config.js, before the
// require nomicfoundation line.
//
// It defines tasks that can be listed using "npx hardhat". For a task "foo",
// can do "npx hardhat help foo", "npx hardhat foo --param1 value1" etc.
//

task("balance", "Prints a stream's balance").setAction(async () => {});

