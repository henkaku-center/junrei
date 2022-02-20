async function main() {
    const NFTFactory = await ethers.getContractFactory("Junrei");
    const nft = await NFTFactory.deploy();
  
    console.log("NFT deployed to:", nft.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });