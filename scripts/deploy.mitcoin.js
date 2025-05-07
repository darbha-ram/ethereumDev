async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying with account:", deployer.address);

    // fill in your token name here
    //const token = await ethers.deployContract("MITCoin", []);
    //console.log("MITCoin contract Address:", await token.getAddress());

    console.log("*** Getting contract factory MITCoin ...");
    const contr = await ethers.getContractFactory("MITCoin");

    console.log("*** Got contract factory MITCoin. calling deploy() ...");
    const mitcoin = await contr.deploy({gasLimit: 210000});

    console.log("After deloy, MITCoin contract:", await mitcoin.getAddress());

  }

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
  });

