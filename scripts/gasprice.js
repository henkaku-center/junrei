async function main() {
    const NFTFactory = await ethers.getContractFactory("Junrei");
    const provider = await NFTFactory.signer;
  
    const prospectiveTx = NFTFactory.getDeployTransaction();
    const txGasCostEstimate = await provider.estimateGas(prospectiveTx);
    console.log(
      "Estimated gas cost:",
      ethers.utils.formatUnits(txGasCostEstimate, "wei")
    );
  
    const gasPriceEstimate = await provider.getGasPrice();
  
    console.log(
      "Estimated gas price (Wei):",
      ethers.utils.formatUnits(gasPriceEstimate, "wei")
    );
    console.log(
      "Estimated gas price (Gwei):",
      ethers.utils.formatUnits(gasPriceEstimate, "gwei")
    );
    console.log(
      "Estimated gas price (Ether):",
      ethers.utils.formatUnits(gasPriceEstimate, "ether")
    );
  
    console.log(
      "Estimated deployment cost in Eth (current):",
      ethers.utils.formatUnits(gasPriceEstimate.mul(txGasCostEstimate), "ether")
    );
    console.log(
      "Estimated deployment cost in Eth (at 150gwei):",
      ethers.utils.formatUnits(
        ethers.utils.parseUnits("150", "gwei").mul(txGasCostEstimate),
        "ether"
      )
    );
    console.log(
      "Estimated deployment cost in Eth (at 130gwei):",
      ethers.utils.formatUnits(
        ethers.utils.parseUnits("130", "gwei").mul(txGasCostEstimate),
        "ether"
      )
    );
    console.log(
      "Estimated deployment cost in Eth (at 100gwei):",
      ethers.utils.formatUnits(
        ethers.utils.parseUnits("100", "gwei").mul(txGasCostEstimate),
        "ether"
      )
    );
}
  
main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  