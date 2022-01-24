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
            tokenNames, tokenSupplies, tokenEquivalencePrice, 0
        )
        await myTokens.deployed()

        const tokens = await myTokens.getTokens()
            // console.log(tokens)

        expect(tokens.length).to.equal(tokenNames.length).to.equal(tokenSupplies.length)

    })
    it("Should have balance as defined", async function() {

        balanceOfFn = async(address, tokenId) => (await myTokens.balanceOf(address, tokenId)).toString()

        // console.log("GOLD Balance of owner : ", await balanceOf(deployer.address, 0));

        expect(await balanceOfFn(myTokens.address, 0)).to.equal("3000000000000000")
        expect(await balanceOfFn(myTokens.address, 1)).to.equal("1000000000000000")
        expect(await balanceOfFn(myTokens.address, 2)).to.equal("4000000000000000")
    });
    // it("should have accurate balance after transfer", async() => {
    //     const safeTransferFromTx = await myTokens.safeTransferFrom(myTokens.address, accounts[2].address, 0, 1000, [])
    //     await safeTransferFromTx.wait()
    //     expect(await balanceOfFn(accounts[2].address, 0)).to.equal("1000")
    //     expect(await balanceOfFn(myTokens.address, 0)).to.equal("2999999999999000")
    // })
    it("Should calculate equivalent prices correctly", async() => {
        const amount = 1000
        for (const [index, price] of tokenEquivalencePrice.entries()) {
            const tokenToEquivalentWei = (await myTokens.tokenToEquivalentWei(index, amount)).toString()
                // console.log(weiToEth(requiredWeiForToken, 8))
            expect(weiToEth(tokenToEquivalentWei, 8)).to.be.approximately(amount / price, 1e-4)
        }
    })

    it("Should calculate tokenAequivalentTokenB value 1", async() => {
        const amount = 1000;
        const indexA = 0;
        const indexB = 1;
        const tokenToEquivalentWei = (await myTokens.tokenAequivalentTokenB(indexA, indexB, amount)).toString()
        expect(tokenToEquivalentWei).be.equal((tokenEquivalencePrice[indexB] * amount / tokenEquivalencePrice[indexA]).toFixed(0))
    })

    it("Should calculate tokenAequivalentTokenB value 2", async() => {
        const amount = 1000;
        const indexA = 1;
        const indexB = 2;
        const tokenToEquivalentWei = (await myTokens.tokenAequivalentTokenB(indexA, indexB, amount)).toString()
        expect(tokenToEquivalentWei).be.equal((tokenEquivalencePrice[indexB] * amount / tokenEquivalencePrice[indexA]).toString().split('.')[0])
    })

    it("Should buy token and balance get updated", async() => {

        const stage1EthBalance = await myTokens.provider.getBalance(accounts[0].address)
        const stage1Token0Balance = await balanceOfFn(accounts[0].address, 0)

        // console.log("Eth balance s1", stage1EthBalance)
        // console.log("Token0 balance s1", stage1Token0Balance)

        const buyTokenTx = await myTokens.buyToken(0, 1000, { value: (1000 * 1e18 / tokenEquivalencePrice[0]).toString() })
        await buyTokenTx.wait()

        const stage2EthBalance = await myTokens.provider.getBalance(accounts[0].address)
        const stage2Token0Balance = await balanceOfFn(accounts[0].address, 0)

        // console.log("Eth balance s2", stage2EthBalance)
        // console.log("Token0 balance s2", stage2Token0Balance)

        expect(parseInt(stage1EthBalance)).be.greaterThan(parseInt(stage2EthBalance))
        expect(parseInt(stage1Token0Balance)).be.lessThan(parseInt(stage2Token0Balance))

        const buyTokenTx2 = await myTokens.buyToken(0, 1000, { value: (1000 * 1e18 / tokenEquivalencePrice[0]).toString() })
        await buyTokenTx2.wait()

        const stage3EthBalance = await myTokens.provider.getBalance(accounts[0].address)
        const stage3Token0Balance = await balanceOfFn(accounts[0].address, 0)

        // console.log("Eth balance s3", stage3EthBalance)
        // console.log("Token0 balance s3", stage3Token0Balance)

        expect(parseInt(stage2EthBalance)).be.greaterThan(parseInt(stage3EthBalance))
        expect(parseInt(stage2Token0Balance)).be.lessThan(parseInt(stage3Token0Balance))

    })

    it("Should buy token for different account", async() => {

        const stage1EthBalance = await myTokens.provider.getBalance(accounts[3].address)
        const stage1Token0Balance = await balanceOfFn(accounts[3].address, 0)

        // console.log("Eth balance s1", stage1EthBalance)
        // console.log("Token0 balance s1", stage1Token0Balance)

        const buyTokenTx = await myTokens.connect(accounts[3]).buyToken(0, 1000, { value: (1000 * 1e18 / tokenEquivalencePrice[0]).toString() })
        await buyTokenTx.wait()

        const stage2EthBalance = await myTokens.provider.getBalance(accounts[3].address)
        const stage2Token0Balance = await balanceOfFn(accounts[3].address, 0)

        // console.log("Eth balance s2", stage2EthBalance)
        // console.log("Token0 balance s2", stage2Token0Balance)

        expect(parseInt(stage1EthBalance)).be.greaterThan(parseInt(stage2EthBalance))
        expect(parseInt(stage1Token0Balance)).be.lessThan(parseInt(stage2Token0Balance))

        const buyTokenTx2 = await myTokens.connect(accounts[3]).buyToken(0, 1000, { value: (1000 * 1e18 / tokenEquivalencePrice[0]).toString() })
        await buyTokenTx2.wait()

        const stage3EthBalance = await myTokens.provider.getBalance(accounts[3].address)
        const stage3Token0Balance = await balanceOfFn(accounts[3].address, 0)

        // console.log("Eth balance s3", stage3EthBalance)
        // console.log("Token0 balance s3", stage3Token0Balance)

        expect(parseInt(stage2EthBalance)).be.greaterThan(parseInt(stage3EthBalance))
        expect(parseInt(stage2Token0Balance)).be.lessThan(parseInt(stage3Token0Balance))

    })

    it("Should buy token for different account index5", async() => {

        const stage1EthBalance = await myTokens.provider.getBalance(accounts[5].address)
        const stage1Token0Balance = await balanceOfFn(accounts[5].address, 2)

        // console.log("Eth balance s1", stage1EthBalance)
        // console.log("Token0 balance s1", stage1Token0Balance)

        const buyTokenTx = await myTokens.connect(accounts[5]).buyToken(2, 1000, { value: (1000 * 1e18 / tokenEquivalencePrice[2]).toString() })
        await buyTokenTx.wait()

        const stage2EthBalance = await myTokens.provider.getBalance(accounts[5].address)
        const stage2Token0Balance = await balanceOfFn(accounts[5].address, 2)

        // console.log("Eth balance s2", stage2EthBalance)
        // console.log("Token0 balance s2", stage2Token0Balance)

        expect(parseInt(stage1EthBalance)).be.greaterThan(parseInt(stage2EthBalance))
        expect(parseInt(stage1Token0Balance)).be.lessThan(parseInt(stage2Token0Balance))

        const buyTokenTx2 = await myTokens.connect(accounts[5]).buyToken(2, 1000, { value: (1000 * 1e18 / tokenEquivalencePrice[2]).toString() })
        await buyTokenTx2.wait()

        const stage3EthBalance = await myTokens.provider.getBalance(accounts[5].address)
        const stage3Token0Balance = await balanceOfFn(accounts[5].address, 2)

        // console.log("Eth balance s3", stage3EthBalance)
        // console.log("Token0 balance s3", stage3Token0Balance)

        expect(parseInt(stage2EthBalance)).be.greaterThan(parseInt(stage3EthBalance))
        expect(parseInt(stage2Token0Balance)).be.lessThan(parseInt(stage3Token0Balance))

    })

    it("Should test swap func", async() => {

        const userIndex = 3;
        const tokenIdA = 0;
        const tokenIdB = 1;
        const amount = 573;
        const equivalentTokenB = (amount * tokenEquivalencePrice[tokenIdB] / tokenEquivalencePrice[tokenIdA]).toString().split('.')[0]

        const beforeAccountBalanceA = await balanceOfFn(accounts[userIndex].address, tokenIdA)
        const beforeTokenBalanceA = await balanceOfFn(myTokens.address, tokenIdA)

        const beforeAccountBalanceB = await balanceOfFn(accounts[userIndex].address, tokenIdB)
        const beforeTokenBalanceB = await balanceOfFn(myTokens.address, tokenIdB)

        // console.log("Contract A", beforeTokenBalanceA)
        // console.log("User A", beforeAccountBalanceA)

        // console.log("Contract B", beforeTokenBalanceB)
        // console.log("User B", beforeAccountBalanceB)

        const swapTokenTx = await myTokens.connect(accounts[userIndex]).swapToken(tokenIdA, tokenIdB, amount)
        await swapTokenTx.wait()

        // console.log("\n\nTransacted...\n")
        // console.log(`User swaped ${amount} Token A out and took ${equivalentTokenB} Token B\n\n`)

        const afterAccountBalanceA = await balanceOfFn(accounts[userIndex].address, tokenIdA)
        const afterTokenBalanceA = await balanceOfFn(myTokens.address, tokenIdA)

        const afterAccountBalanceB = await balanceOfFn(accounts[userIndex].address, tokenIdB)
        const afterTokenBalanceB = await balanceOfFn(myTokens.address, tokenIdB)

        // console.log("User A", afterAccountBalanceA)
        // console.log("Contract A", afterTokenBalanceA)

        // console.log("User B", afterAccountBalanceB)
        // console.log("Contract B", afterTokenBalanceB)

        expect(parseInt(afterAccountBalanceA)).be.equal(parseInt(beforeAccountBalanceA) - amount)
        expect(parseInt(afterTokenBalanceA)).be.equal(parseInt(beforeTokenBalanceA) + amount)
        expect(parseInt(afterAccountBalanceB)).be.equal(parseInt(beforeAccountBalanceB) + parseInt(equivalentTokenB))
        expect(parseInt(afterTokenBalanceB)).be.equal(parseInt(beforeTokenBalanceB) - parseInt(equivalentTokenB))

    })

    it("Should test swap func again index5", async() => {

        const userIndex = 5;
        const tokenIdA = 2;
        const tokenIdB = 1;
        const amount = 329;
        const equivalentTokenB = (amount * tokenEquivalencePrice[tokenIdB] / tokenEquivalencePrice[tokenIdA]).toString().split('.')[0]

        const beforeAccountBalanceA = await balanceOfFn(accounts[userIndex].address, tokenIdA)
        const beforeTokenBalanceA = await balanceOfFn(myTokens.address, tokenIdA)

        const beforeAccountBalanceB = await balanceOfFn(accounts[userIndex].address, tokenIdB)
        const beforeTokenBalanceB = await balanceOfFn(myTokens.address, tokenIdB)

        // console.log("Contract A", beforeTokenBalanceA)
        // console.log("User A", beforeAccountBalanceA)

        // console.log("Contract B", beforeTokenBalanceB)
        // console.log("User B", beforeAccountBalanceB)

        const swapTokenTx = await myTokens.connect(accounts[userIndex]).swapToken(tokenIdA, tokenIdB, amount)
        await swapTokenTx.wait()

        // console.log("\n\nTransacted...\n")
        // console.log(`User swaped ${amount} Token A out and took ${equivalentTokenB} Token B\n\n`)

        const afterAccountBalanceA = await balanceOfFn(accounts[userIndex].address, tokenIdA)
        const afterTokenBalanceA = await balanceOfFn(myTokens.address, tokenIdA)

        const afterAccountBalanceB = await balanceOfFn(accounts[userIndex].address, tokenIdB)
        const afterTokenBalanceB = await balanceOfFn(myTokens.address, tokenIdB)

        // console.log("User A", afterAccountBalanceA)
        // console.log("Contract A", afterTokenBalanceA)

        // console.log("User B", afterAccountBalanceB)
        // console.log("Contract B", afterTokenBalanceB)

        expect(parseInt(afterAccountBalanceA)).be.equal(parseInt(beforeAccountBalanceA) - amount)
        expect(parseInt(afterTokenBalanceA)).be.equal(parseInt(beforeTokenBalanceA) + amount)
        expect(parseInt(afterAccountBalanceB)).be.equal(parseInt(beforeAccountBalanceB) + parseInt(equivalentTokenB))
        expect(parseInt(afterTokenBalanceB)).be.equal(parseInt(beforeTokenBalanceB) - parseInt(equivalentTokenB))

    })
});