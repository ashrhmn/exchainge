const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("MyTokens", async function() {
    let myTokens = null
    let swapTokens = null
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
            const SwapTokens = await ethers.getContractFactory("SwapTokens");
            swapTokens = await SwapTokens.deploy("test swapping");

            await swapTokens.deployed();    
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
    it("Should Return All Tokens", async () => {
        const Alltokens = await myTokens.getTokens()
        console.log(Alltokens);

    
    })
    

    it("Should deploy with name", async () => {
        expect(await swapTokens.name()).to.equal("test swapping");
        console.log(swapTokens.address);
    })
    it("Should Buy", async () => {
        const buy = await myTokens.buyToken(1, 10000,accounts[1].address, [])
        await buy.wait()
        expect(await balanceOfFn(accounts[1].address, 1)).to.equal("10000")
        //console.log(balanceOfFn(deployer.address, 0));
    })
    it("Should give the balance", async () => {
        const balance = await myTokens.balanceOf(accounts[1].address, 1)
        console.log(balance);
    })
    it("Shoult return the comparism value", async () => { 
        const token0 = await myTokens.tokenToEther(0,1);
        //const token1 = await myTokens.tokenToEther(1);
        //const res = token1 / token0;
        //console.log(Math.round(res,0));
        console.log(token0);
    })
    it("SHould Swap Token", async () => {
        //myTokens._setApproveforAll(accounts[1].address, true);
        const swap = await myTokens.swapToken(0, 1, 500, accounts[1].address)
        await swap.wait()
        
        console.log(await balanceOfFn(accounts[1].address, 0));
        console.log(await balanceOfFn(accounts[0].address, 0));
    })
        it("Should give the balance", async () => {
        const balance = await myTokens.balanceOf(accounts[1].address, 1)
        console.log(balance);
        })
    
});

