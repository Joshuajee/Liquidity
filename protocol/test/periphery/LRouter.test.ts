import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import {  parseEther, zeroAddress } from "viem";
import sqrt from "bigint-isqrt";

describe("LRouter", function () {

  async function deploy() {

    // Contracts are deployed using the first signer/account by default
    const [account1, otherAccount] = await hre.viem.getWalletClients();

    const MockERC20 = await hre.viem.deployContract("MockERC20", ["TUSD", "TUSD"])

    const MockERC20_1 = await hre.viem.deployContract("MockERC20", ["TGBP", "TGBP"])

    const LSwapPair = await hre.viem.deployContract("LSwapPair")

    const LFactory = await hre.viem.deployContract("LFactory", [LSwapPair.address])

    const LRouter = await hre.viem.deployContract("LRouter", [LFactory.address, LSwapPair.address])

    const publicClient = await hre.viem.getPublicClient();

    return {  LFactory, LSwapPair, LRouter,  MockERC20, MockERC20_1, account1,  otherAccount, publicClient, };

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

      await MockERC20.write.approve([LRouter.address, deposit * 10n])

      await MockERC20_1.write.approve([LRouter.address, deposit * 10n])

      await LRouter.write.addLiquidity([input])

      const poolAddress = await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])

      const LSwapPairPool = await hre.viem.getContractAt("LSwapPair", poolAddress)

      expect(await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])).to.not.be.equal(zeroAddress)

      expect(await LSwapPairPool.read.totalSupply()).to.be.equal(expectedLpShare + 1000n)

      expect(await LSwapPairPool.read.balanceOf([account1.account.address])).to.be.equal(expectedLpShare)

      // Reserves should be equal to deposit
      expect(await LSwapPairPool.read.getReserves()).to.be.deep.equal([deposit, deposit])

    });
    


  });

 
});
