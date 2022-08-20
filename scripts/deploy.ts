import { ethers } from "hardhat";

async function main() {
  const GasConsumer = await ethers.getContractFactory("GasConsumer");
  const gasConsumer = await GasConsumer.deploy();

  await gasConsumer.deployed();

  console.log(`GasConsumer deployed to ${gasConsumer.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
