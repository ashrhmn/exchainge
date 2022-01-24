const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("MyTokens", async function() {
    let myTokens = null
    let accounts = []
    let deployer = null
    let tokenSupplies = []
    let tokenNames = []
    let tokenEquivalencePrice = []
    let balanceOfFn = null
    const weiToEth = (wei, decimalPoint) => parseInt(wei.substring(0, decimalPoint)) * Math.pow(10, (wei.length - 18 - decimalPoint))
    it("should deploy, mint and have same number of tokens after initialize", async() => {

        tokenNames = ["GOLD", "SILVER", "COPPER"]
        tokenSupplies = [
            BigNumber.from("3000000000000000"),
            BigNumber.from("1000000000000000"),
            BigNumber.from("4000000000000000")
        ]
        tokenEquivalencePrice = [
            BigNumber.from("3487"),
            BigNumber.from("18974"),
            BigNumber.from("328473"),
        ]

        expect(tokenNames.length).to.equal(tokenSupplies.length)

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        const MyTokens = await ethers.getContractFactory("MyTokens")
        myTokens = await MyTokens.deploy(
            tokenNames, tokenSupplies, tokenEquivalencePrice
        )
        await myTokens.deployed()

        const tokens = await myTokens.getTokens()
            // console.log(tokens)

        expect(tokens.length).to.equal(tokenNames.length).to.equal(tokenSupplies.length)

    })
    it("Should have balance as defined", async function() {

        balanceOfFn = async(address, tokenId) => (await myTokens.balanceOf(address, tokenId)).toString()

        // console.log("GOLD Balance of owner : ", await balanceOf(deployer.address, 0));

        expect(await balanceOfFn(deployer.address, 0)).to.equal("3000000000000000")
        expect(await balanceOfFn(deployer.address, 1)).to.equal("1000000000000000")
        expect(await balanceOfFn(deployer.address, 2)).to.equal("4000000000000000")
    });
    it("should have accurate balance after transfer", async() => {
        const safeTransferFromTx = await myTokens.safeTransferFrom(deployer.address, accounts[2].address, 0, 1000, [])
        await safeTransferFromTx.wait()
        expect(await balanceOfFn(accounts[2].address, 0)).to.equal("1000")
        expect(await balanceOfFn(deployer.address, 0)).to.equal("2999999999999000")
    })
    it("Should calculate equivalent prices correctly", async() => {
        const amount = 1000
        for (const [index, price] of tokenEquivalencePrice.entries()) {
            const tokenToEquivalentWei = (await myTokens.tokenToEquivalentWei(index, amount)).toString()
                // console.log(weiToEth(requiredWeiForToken, 8))
            expect(weiToEth(tokenToEquivalentWei, 8)).to.be.approximately(amount / price, 1e-4)
        }
    })
});