const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTs available via the contract", function () {
    it("Should be claimable the regular way by contract owner", async function () {
        const NFTFactory = await ethers.getContractFactory("Junrei")
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await expect(() => nft.claim()).to.changeTokenBalance(nft, NFTFactory.signer, 1);
    });
    it("Should be claimable the regular way by the public", async function () {
        const [owner, nonOwnerWallet] = await ethers.getSigners();
        const NFTFactory = await ethers.getContractFactory("Junrei");
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await expect(() => nft.connect(nonOwnerWallet).claim()).to.changeTokenBalance(nft, nonOwnerWallet, 1);
    });
    it("Should generate larger token IDs on subsequent claims", async function () {
        const [owner, nonOwnerWallet] = await ethers.getSigners();
        const NFTFactory = await ethers.getContractFactory("Junrei");
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await expect(() => nft.connect(nonOwnerWallet).claim()).to.changeTokenBalance(nft, nonOwnerWallet, 1);
        await expect(() => nft.connect(nonOwnerWallet).claim()).to.changeTokenBalance(nft, nonOwnerWallet, 1);
    });
    it("Should have reserve IDs that are not claimable by the public", async function () {
        const [owner, nonOwnerWallet] = await ethers.getSigners();
        const NFTFactory = await ethers.getContractFactory("Junrei")
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await expect(nft.connect(nonOwnerWallet).ownerClaim(9501)).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it("Should have reserve IDs that are claimable by contract owner", async function () {
        const NFTFactory = await ethers.getContractFactory("Junrei")
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await expect(() => nft.ownerClaim(9501)).to.changeTokenBalance(nft, NFTFactory.signer, 1);
    });
    it("Should produce no token URI for claimed tokens before reveal", async function () {
        const [owner, nonOwnerWallet] = await ethers.getSigners();
        const NFTFactory = await ethers.getContractFactory("Junrei");
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await nft.claim();
        expect(await nft.tokenURI(1)).to.equal('');
    });
    it("Should produce token URI for claimed tokens after reveal", async function () {
        const [owner, nonOwnerWallet] = await ethers.getSigners();
        const NFTFactory = await ethers.getContractFactory("Junrei");
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await nft.claim();
        await nft.setBaseURI('ipfs://QmZq5zbk1yorT6Q3bT5N1SE3cDq5YkN8RsMD4SBauFYYtj/');
        expect(await nft.tokenURI(1)).to.equal('ipfs://QmZq5zbk1yorT6Q3bT5N1SE3cDq5YkN8RsMD4SBauFYYtj/1.json');
    });
    it("Should not allow claiming by users when paused", async function () {
        const [owner, nonOwnerWallet] = await ethers.getSigners();
        const NFTFactory = await ethers.getContractFactory("Junrei");
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await nft.pause();
        await expect(nft.connect(nonOwnerWallet).claim()).to.be.revertedWith('Pausable: paused');
    });
    it("Should allow claiming by users after being unpaused", async function () {
        const [owner, nonOwnerWallet] = await ethers.getSigners();
        const NFTFactory = await ethers.getContractFactory("Junrei");
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await nft.pause();
        await nft.unpause();
        await expect(() => nft.claim()).to.changeTokenBalance(nft, NFTFactory.signer, 1);
    });
    it("Should cap claims at a maximum of 5, even after transfers", async function () {
        const [owner, nonOwnerWallet] = await ethers.getSigners();
        const NFTFactory = await ethers.getContractFactory("Junrei");
        const nft = await NFTFactory.deploy();
        await nft.deployed();
        await expect(() => nft.claim()).to.changeTokenBalance(nft, owner, 1);
        await expect(() => nft.claim()).to.changeTokenBalance(nft, owner, 1);
        await expect(() => nft.claim()).to.changeTokenBalance(nft, owner, 1);
        await expect(() => nft.claim()).to.changeTokenBalance(nft, owner, 1);
        await expect(() => nft.claim()).to.changeTokenBalance(nft, owner, 1);
        await expect(nft.claim()).to.be.revertedWith('Claim limit reached');
        await expect(() => nft.transferFrom(owner.address, nonOwnerWallet.address, 1)).to.changeTokenBalance(nft, owner, -1);
        await expect(nft.claim()).to.be.revertedWith('Claim limit reached');  // Still fails after transferring one away
    });
});