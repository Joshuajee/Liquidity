import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { checksumAddress, parseEther, zeroAddress } from "viem";
import sqrt from "bigint-isqrt";

describe("LSwapPair", function () {

  async function deploy() {

    // Contracts are deployed using the first signer/account by default
    const [account1, account2] = await hre.viem.getWalletClients();

    const MockERC20 = await hre.viem.deployContract("MockERC20", ["TUSD", "TUSD"])

    const MockERC20_1 = await hre.viem.deployContract("MockERC20", ["TGBP", "TGBP"])

    const LSwapPair = await hre.viem.deployContract("LSwapPair")

    const LFactory = await hre.viem.deployContract("LFactory", [LSwapPair.address])

    await LFactory.write.createPair([MockERC20.address, MockERC20_1.address])

    const poolAddress = await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])

    const LSwapPairPool = await hre.viem.getContractAt("LSwapPair", poolAddress)

    const publicClient = await hre.viem.getPublicClient();

    return {  LFactory, LSwapPair, LSwapPairPool, MockERC20, MockERC20_1, account1, account2, publicClient, };

  }


  async function deposit() {
    const data = await loadFixture(deploy);

    const { account1, LSwapPairPool, MockERC20, MockERC20_1 } = data

    const deposit0 = parseEther("100", "wei")
    const deposit1 = parseEther("100", "wei")

    const expectedLpShare = sqrt(deposit0 * deposit0) - 1000n

    await MockERC20.write.transfer([LSwapPairPool.address, deposit0]) 
    await MockERC20_1.write.transfer([LSwapPairPool.address, deposit1]) 

    await LSwapPairPool.write.mint([account1.account.address])

    expect(await LSwapPairPool.read.totalSupply()).to.be.equal(expectedLpShare + 1000n)

    expect(await LSwapPairPool.read.balanceOf([account1.account.address])).to.be.equal(expectedLpShare)

    // Reserves should be equal to deposit
    expect(await LSwapPairPool.read.getReserves()).to.be.deep.equal([deposit0, deposit1])

    return {...data, deposit0, deposit1 }
  }

  describe("Deposit Liquidity", function () {



  });





 
});
