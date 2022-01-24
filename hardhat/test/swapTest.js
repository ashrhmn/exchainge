const hre = require("hardhat");
describe("SwapTokens", async function () {
    const SwapTokens = await ethers.getContractFactory("SwapTokens");
    const swapTokens = await SwapTokens.deploy("test swapping");

    await swapTokens.deployed();
    it("Should deploy with name", async () => {
        expect(await swapTokens.name()).to.equal("test swapping");
        console.log(swapTokens.address);
    })
})
