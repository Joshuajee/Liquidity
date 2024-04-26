import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { checksumAddress, parseEther, zeroAddress } from "viem";

describe("TEST", function () {

  async function deploy() {

    // Contracts are deployed using the first signer/account by default
    const [account1, account2, account3, account4] = await hre.viem.getWalletClients();

    const MockERC20 = await hre.viem.deployContract("MockERC20", ["TUSD", "TUSD"])

    const Vault = await hre.viem.deployContract("LCollateralPool", [MockERC20.address, "E", "e"])

    await MockERC20.write.transfer([account2.account.address, parseEther("10000", "wei")])

    await MockERC20.write.approve([Vault.address, parseEther("10000", "wei")])

    const publicClient = await hre.viem.getPublicClient();

    return {  Vault, MockERC20,  account1,  account2, account3, account4, publicClient, };

  }


  describe("Deployment", function () {

    it("ttt", async function () {

      const deposit = parseEther("1000", "wei")

      const { Vault, MockERC20, account1, account2 } = await loadFixture(deploy);

      await Vault.write.deposit([deposit, account1.account.address])

      console.log("W - ", await Vault.read.maxWithdraw([account1.account.address]))

      console.log("B - ", await Vault.read.balanceOf([account1.account.address]))

      await Vault.write.deposit([deposit, account2.account.address])

      console.log("W - ", await Vault.read.maxWithdraw([account2.account.address]))

      console.log("B - ", await Vault.read.balanceOf([account2.account.address]))


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
