import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { checksumAddress, parseEther, zeroAddress } from "viem";

describe("LFactory", function () {

  async function deploy() {

    // Contracts are deployed using the first signer/account by default
    const [account1, otherAccount] = await hre.viem.getWalletClients();

    const MockERC20 = await hre.viem.deployContract("MockERC20", ["TUSD", "TUSD"])

    const MockERC20_1 = await hre.viem.deployContract("MockERC20", ["TGBP", "TGBP"])

    const LSwapPair = await hre.viem.deployContract("LSwapPair")

    const LFactory = await hre.viem.deployContract("LFactory", [LSwapPair.address])

    const publicClient = await hre.viem.getPublicClient();

    return {  LFactory, LSwapPair,  MockERC20, MockERC20_1, account1,  otherAccount, publicClient, };

  }

  async function deployAndCreateCollateralPool() {

    const data = await loadFixture(deploy);

    const { LFactory, MockERC20, account1 } = data

    const deposit = parseEther("10", "wei")

    await MockERC20.write.approve([LFactory.address, deposit])

    expect(await LFactory.read.getCollateralPool([MockERC20.address])).to.be.equal(zeroAddress)

    await LFactory.write.createCollateralPool([MockERC20.address, deposit, account1.account.address])

    expect(await LFactory.read.getCollateralPool([MockERC20.address])).to.not.be.equal(zeroAddress)
    
    return {...data }

  }

  async function deployCollateralPoolAndAddLiquidity() {

    const data = await loadFixture(deploy);

    const { LFactory, MockERC20, MockERC20_1, account1 } = data

    const deposit = parseEther("100000", "wei")

    await MockERC20.write.approve([LFactory.address, deposit * 2n])

    await MockERC20_1.write.approve([LFactory.address, deposit])

    await LFactory.write.createPair([MockERC20.address, MockERC20_1.address])

    const poolAddress = await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])

    const LSwapPairPool = await hre.viem.getContractAt("LSwapPair", poolAddress)

    await MockERC20.write.transfer([LSwapPairPool.address, deposit]) 
    await MockERC20_1.write.transfer([LSwapPairPool.address, deposit]) 

    await LSwapPairPool.write.mint([account1.account.address])

    await LFactory.write.createCollateralPool([MockERC20.address, deposit, account1.account.address])

    const LCollateralPool = await hre.viem.getContractAt("LCollateralPool", await LFactory.read.getCollateralPool([MockERC20.address]))

    await MockERC20.write.approve([LCollateralPool.address, deposit]);

    await LCollateralPool.write.deposit([deposit, data.account1.account.address])

    return {...data, LCollateralPool, LSwapPairPool }

  }


  describe("Deployment", function () {

    it("Should set the right LSwapPairAddress", async function () {

      const { LFactory, LSwapPair } = await loadFixture(deploy);

      expect(await LFactory.read.PAIR_REFERENCE()).to.equal(checksumAddress(LSwapPair.address));

    });

  });

  describe("Create Collateral Pool", function () {

    it("Should Create new Pool", async function () {

      const { LFactory, MockERC20, account1 } = await loadFixture(deploy);

      const deposit = parseEther("10", "wei")

      await MockERC20.write.approve([LFactory.address, deposit])

      expect(await LFactory.read.getCollateralPool([MockERC20.address])).to.be.equal(zeroAddress)

      await LFactory.write.createCollateralPool([MockERC20.address, deposit, account1.account.address])

      expect(await LFactory.read.getCollateralPool([MockERC20.address])).to.not.be.equal(zeroAddress)

      //expect(await MockERC20.read.balanceOf([]))
    });

    it("Should Revert if Pool Already Exist", async function () {

      const { LFactory, MockERC20, account1 } = await loadFixture(deployAndCreateCollateralPool);

      const deposit = parseEther("10", "wei")

      await MockERC20.write.approve([LFactory.address, deposit])

      await expect(
        LFactory.write.createCollateralPool([MockERC20.address, deposit, account1.account.address])
      ).to.be.rejectedWith("PoolAlreadyExist")

    });

  });


  describe("Create LSwapPair Pool - Success", function () {

    it("Should Create new Pair", async function () {

      const { LFactory, MockERC20, MockERC20_1 } = await loadFixture(deploy);

      expect(await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])).to.be.equal(zeroAddress)

      await LFactory.write.createPair([MockERC20.address, MockERC20_1.address])

      expect(await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])).to.not.be.equal(zeroAddress)


    });


    it("Should Create new Pair", async function () {

      const { LFactory, MockERC20, MockERC20_1 } = await loadFixture(deploy);

      expect(await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])).to.be.equal(zeroAddress)

      await LFactory.write.createPair([MockERC20.address, MockERC20_1.address])

      expect(await LFactory.read.getPool([MockERC20.address, MockERC20_1.address])).to.not.be.equal(zeroAddress)


    });

  });



  describe("Lending - Success", function () {

    it("Should be able to borrow", async function () {

      const { LFactory, account1, LSwapPairPool, MockERC20, MockERC20_1 } = await loadFixture(deployCollateralPoolAndAddLiquidity);

      const amount = parseEther("50", "wei")

      const initialPoolBalance = await MockERC20_1.read.balanceOf([LSwapPairPool.address])

      const initialBorrowerBalance = await MockERC20_1.read.balanceOf([account1.account.address])

      await LFactory.write.borrow([MockERC20.address, MockERC20_1.address, amount])

      const userLoans = await LFactory.read.getUserLoans([account1.account.address, MockERC20.address])

      expect(await MockERC20_1.read.balanceOf([LSwapPairPool.address])).to.be.equal(initialPoolBalance - amount)

      expect(await MockERC20_1.read.balanceOf([account1.account.address])).to.be.equal(initialBorrowerBalance + amount)

      console.log(userLoans)

      console.log(await MockERC20_1.read.balanceOf([account1.account.address]), initialBorrowerBalance)

      console.log(await LSwapPairPool.read.getReserves())

      console.log(await LSwapPairPool.read.getActualReserves())

    });


    it("Should be able to borrow twice", async function () {

      const { LFactory, MockERC20, MockERC20_1, account1 } = await loadFixture(deployCollateralPoolAndAddLiquidity);

      const amount = parseEther("50", "wei")

      await MockERC20_1.write.approve([LFactory.address, amount])

      await LFactory.write.borrow([MockERC20.address, MockERC20_1.address, amount])

      await LFactory.write.borrow([MockERC20.address, MockERC20_1.address, amount])

      console.log(await LFactory.read.getUserLoans([account1.account.address, MockERC20.address]))

    });


    it("Should be able to repay loan", async function () {

      const { LFactory, MockERC20, MockERC20_1, account1 } = await loadFixture(deployCollateralPoolAndAddLiquidity);

      const amount = parseEther("50", "wei")

      await MockERC20_1.write.approve([LFactory.address, amount])

      await LFactory.write.borrow([MockERC20.address, MockERC20_1.address, amount])

      await LFactory.write.repay([MockERC20.address, MockERC20_1.address, 0n, amount * 2n])

      console.log(await LFactory.read.getUserLoans([account1.account.address, MockERC20.address]))

    });


  });

});
