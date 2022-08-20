import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { config } from "hardhat";

describe("GasConsumer", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();

    const GasConsumer = await ethers.getContractFactory("GasConsumer");
    const gasConsumer = await GasConsumer.deploy();

    return { gasConsumer, owner, otherAccount, GasConsumer };
  }

  describe("Deployment", function () {
    it("Should be unlocked at first", async function () {
      const { gasConsumer } = await loadFixture(deployContract);

      expect(await gasConsumer.isLocked()).to.equal(false);
    });

    it("Should set the right owner", async function () {
      const { gasConsumer, owner } = await loadFixture(deployContract);

      expect(await gasConsumer.owner()).to.equal(owner.address);
    });

    it("Should fail to lock if a non-owner try to lock", async function () {
      const { gasConsumer, otherAccount } = await loadFixture(deployContract);

      const gasConsumerFromOtherAccount = gasConsumer.connect(otherAccount);

      await expect(
        gasConsumerFromOtherAccount.lock({
          from: otherAccount.address,
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail to unlock if a non-owner try to lock", async function () {
      const { gasConsumer, otherAccount } = await loadFixture(deployContract);

      const gasConsumerFromOtherAccount = gasConsumer.connect(otherAccount);

      await expect(
        gasConsumerFromOtherAccount.unlock({
          from: otherAccount.address,
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Lock", function () {
    it("Should fail to unlock if contract unlocked", async function () {
      const { gasConsumer } = await loadFixture(deployContract);

      await expect(gasConsumer.unlock()).to.be.revertedWith(
        "contract already unlocked"
      );

      await expect(gasConsumer.lock()).not.to.be.reverted;

      await expect(gasConsumer.unlock()).not.to.be.reverted;

      await expect(gasConsumer.unlock()).to.be.revertedWith(
        "contract already unlocked"
      );
    });

    it("Should fail to lock if contract locked", async function () {
      const { gasConsumer } = await loadFixture(deployContract);

      await expect(gasConsumer.lock()).not.to.be.reverted;

      await expect(gasConsumer.lock()).to.be.revertedWith(
        "contract already locked"
      );
    });
  });

  describe("Go", function () {
    describe("waste gas", function () {
      it("Should run if gasUsed is less than max", async function () {
        const { gasConsumer } = await loadFixture(deployContract);

        await expect(gasConsumer.go(config.networks.hardhat.blockGasLimit / 4))
          .not.to.be.reverted;
      });

      it("Should revert if gasUsed exceed block gas limit", async function () {
        const { gasConsumer } = await loadFixture(deployContract);
        console.log("max gas is ", config.networks.hardhat.blockGasLimit);
        await expect(gasConsumer.go(config.networks.hardhat.blockGasLimit + 1))
          .to.be.reverted;
      });
    });
  });
});
