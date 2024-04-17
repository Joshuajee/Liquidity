import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { checksumAddress, parseEther, zeroAddress } from "viem";

describe("LFactory", function () {

  async function deploy() {

    // Contracts are deployed using the first signer/account by default
    const [account1, otherAccount] = await hre.viem.getWalletClients();

    const MockERC20 = await hre.viem.deployContract("MockERC20", ["TUSD", "TUSD"])

    const LSwapPair = await hre.viem.deployContract("LSwapPair")

    const LFactory = await hre.viem.deployContract("LFactory", [LSwapPair.address])

    const publicClient = await hre.viem.getPublicClient();

    return {  LFactory, LSwapPair,  MockERC20,  account1,  otherAccount, publicClient, };

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

      const { LFactory, MockERC20, account1 } = await loadFixture(deploy);

      const deposit = parseEther("10", "wei")

      await MockERC20.write.approve([LFactory.address, deposit])

      expect(await LFactory.read.getCollateralPool([MockERC20.address])).to.be.equal(zeroAddress)

      await LFactory.write.createCollateralPool([MockERC20.address, deposit, account1.account.address])

      expect(await LFactory.read.getCollateralPool([MockERC20.address])).to.not.be.equal(zeroAddress)

      //expect(await MockERC20.read.balanceOf([]))
    });


  });

 
  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount, publicClient } =
  //         await loadFixture(deployOneYearLockFixture);

  //       await time.increaseTo(unlockTime);

  //       const hash = await lock.write.withdraw();
  //       await publicClient.waitForTransactionReceipt({ hash });

  //       // get the withdrawal events in the latest block
  //       const withdrawalEvents = await lock.getEvents.Withdrawal();
  //       expect(withdrawalEvents).to.have.lengthOf(1);
  //       expect(withdrawalEvents[0].args.amount).to.equal(lockedAmount);
  //     });
  //   });
  // });
});
