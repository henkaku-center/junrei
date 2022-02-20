/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 require("@nomiclabs/hardhat-waffle");
 require("@nomiclabs/hardhat-etherscan");
 require('hardhat-contract-sizer');
 require("hardhat-gas-reporter");
 
 const { OC_ENV, ROPSTEN_API_URL, RINKEBY_API_URL, MAINNET_API_URL, PRIVATE_KEY, ETHERSCAN_API_KEY, GAS_PRICE, ETH_PRICE } = process.env;
 
 let networkConfig = {hardhat: {}};  // Local Hardhat test blockchain is always available
 
 if (PRIVATE_KEY) {
   // All other network operations require a wallet PK to sign.
   if (RINKEBY_API_URL) {
     networkConfig.rinkeby = {
       url: RINKEBY_API_URL,
       accounts: [`0x${PRIVATE_KEY}`]
     };
   }
   if (ROPSTEN_API_URL) {
     networkConfig.ropsten = {
       url: ROPSTEN_API_URL,
       accounts: [`0x${PRIVATE_KEY}`]
     };
   }
   if (MAINNET_API_URL) {
     networkConfig.mainnet = {
       url: MAINNET_API_URL,
       accounts: [`0x${PRIVATE_KEY}`]
     };
   }
 }
 
 let config = {
   solidity: {
     version: "0.8.4",
     settings: {
       optimizer: {
         enabled: OC_ENV === 'production',
         runs: 200
       }
     }
   },
   defaultNetwork: "hardhat",  // DO NOT CHANGE. defaultNetwork is used for unit tests.
   networks: networkConfig,
   contractSizer: {
     alphaSort: true,
     disambiguatePaths: false,
     runOnCompile: true,
     strict: true,
   },
   gasReporter: {
     currency: 'USD',
     gasPrice: GAS_PRICE || 150,
     ethPrice: ETH_PRICE || 4650
     }
 };
 
 if (ETHERSCAN_API_KEY) {
   // We only use Etherscan for contract verification, so don't need a wallet key.
   config.etherscan = {apiKey: ETHERSCAN_API_KEY};
 }
 
 module.exports = config;