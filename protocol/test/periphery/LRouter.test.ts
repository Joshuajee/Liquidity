import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { maxUint256, parseEther, zeroAddress } from "viem";
import sqrt from "bigint-isqrt";

describe("LRouter", function () {

  async function deploy() {

    // Contracts are deployed using the first signer/account by default
    const [account1, account2] = await hre.viem.getWalletClients();

    const MockERC20 = await hre.viem.deployContract("MockERC20", ["TUSD", "TUSD"])

    const MockERC20_1 = await hre.viem.deployContract("MockERC20", ["TGBP", "TGBP"])

    const LSwapPair = await hre.viem.deployContract("LSwapPair")

    const LFactory = await hre.viem.deployContract("LFactory", [LSwapPair.address])

    const LRouter = await hre.viem.deployContract("LRouter", [LFactory.address, LSwapPair.address])

    const LOracle = await hre.viem.deployContract("LSlidingWindowOracle", [LFactory.address, 3600, 60])

    await LFactory.write.setOracle([LOracle.address])
    
    const publicClient = await hre.viem.getPublicClient();

    return {  LFactory, LSwapPair, LRouter,  MockERC20, MockERC20_1, account1,  account2, publicClient, };

  }

  async function deployWithLiquidity () {

    const data = await loadFixture(deploy);

    const { account1, MockERC20, MockERC20_1 } = data

    const deposit = parseEther("10000", "wei")

    const input : any = [
      MockERC20.address,
      MockERC20_1.address,
      deposit,
      deposit,
      0n, 0n, 
      account1.account.address,
      100000000000
    ]

    const MockERC20_2 = await hre.viem.deployContract("MockERC20", ["TGBP", "TGBP"])

    await MockERC20.write.approve([data.LRouter.address, maxUint256])

    await MockERC20_1.write.approve([data.LRouter.address, maxUint256])

    await MockERC20_2.write.approve([data.LRouter.address, maxUint256])

    await data.LRouter.write.addLiquidity([input])

    return { ...data, deposit, MockERC20_2 }

  }



  describe("Adding Liquidity", function () {

    it("Should Create new Pair and add Liquidity", async function () {

      const { LRouter, LFactory, MockERC20, MockERC20_1, account1 } = await loadFixture(deploy);

      expect(await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])).to.be.equal(zeroAddress)

      const deposit = parseEther("10000", "wei")

      const expectedLpShare = sqrt(deposit * deposit) - 1000n

      const input : any = [
        MockERC20.address,
        MockERC20_1.address,
        deposit,
        deposit,
        0n, 0n, 
        account1.account.address,
        "1000000000000000"
      ]

      await MockERC20.write.approve([LRouter.address, deposit])

      await MockERC20_1.write.approve([LRouter.address, deposit])

      await LRouter.write.addLiquidity([input])

      const poolAddress = await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])

      const LSwapPairPool = await hre.viem.getContractAt("LSwapPair", poolAddress)

      expect(await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])).to.not.be.equal(zeroAddress)

      expect(await LSwapPairPool.read.totalSupply()).to.be.equal(expectedLpShare + 1000n)

      expect(await LSwapPairPool.read.balanceOf([account1.account.address])).to.be.equal(expectedLpShare)

      // Reserves should be equal to deposit
      //expect(await LSwapPairPool.read.getReserves()).to.be.deep.equal([deposit, deposit, 1715089057n])

    });

    it("Should add Liquidity with previewly created pair", async function () {

      const { LRouter, deposit, MockERC20, MockERC20_1, account1 } = await loadFixture(deployWithLiquidity);

      const input : any = [
        MockERC20.address,
        MockERC20_1.address,
        deposit,
        deposit,
        0n, 0n, 
        account1.account.address,
        "1000000000000000"
      ]

      await LRouter.write.addLiquidity([input])

    });


    it("Should add Liquidity with another created pair", async function () {

      const { LRouter, deposit, MockERC20_2, MockERC20_1, account1 } = await loadFixture(deployWithLiquidity);

      const input : any = [
        MockERC20_2.address,
        MockERC20_1.address,
        deposit,
        deposit,
        0n, 0n, 
        account1.account.address,
        "1000000000000000"
      ]

      await LRouter.write.addLiquidity([input])

    });
    
  });


  describe("Swapping", function () {

    it("Swapping should work", async function () {

      const { LRouter, deposit, MockERC20, MockERC20_1, account2 } = await loadFixture(deployWithLiquidity);

      await LRouter.write.swapExactTokenForToken([
        deposit/100n, deposit/10000n,
        [MockERC20.address, MockERC20_1.address],
        account2.account.address,
        BigInt(Date.now())
      ])


    });
    
  });



  describe("Collateral", function () {

    it("Depositing Collateral", async function () {

      const { LRouter, deposit, MockERC20, MockERC20_1, account1 } = await loadFixture(deployWithLiquidity);

      await LRouter.write.depositCollateral([ MockERC20.address, deposit, account1.account.address])


    });
    
  });
 
});
