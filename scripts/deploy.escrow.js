// To deploy MyEscrow.sol
// - The 2 signers must be specified in hardhat.config.js as the 2 accounts. They are used
//       as the buyer and arbiter.
// - The 3rd party in the escrow (seller) is hardcoded to a Metamask address.
// - The deployContract() call does not specify a gasLimit. If needed, try like so:
//     ethers.deployContract("MyEscrow", [buyerAddress, sellerAddress, arbiterAddress], {gasLimit: 123000})
//

async function main() {
    const signers = await ethers.getSigners();
    //console.log("Signers: ", signers);

    // caution - must define two signers in hardhat.config
    const buyerAddress   = signers[0].address;
    const arbiterAddress = signers[1].address;
    const sellerAddress  = "0xE74D3B7eC9Ad1E2341abc69D22F2820B88d4D62b"; // metamask account #1

    // const arbiterAddress = "0xD8dfE02d0eD3Ff0E9fc100EdE06244c28d6f3655";

    console.log("Buyer addr:   ", buyerAddress); 
    console.log("Seller addr:  ", sellerAddress); 
    console.log("Arbiter addr: ", arbiterAddress); 
    console.log("Deploying Escrow contract with buyer signer: ", buyerAddress);
 
    const escrowCon = await ethers.deployContract("MyEscrow", [buyerAddress, sellerAddress, arbiterAddress]);
    console.log("MyEscrow Contract Address:", await escrowCon.getAddress());
  }

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
  });

