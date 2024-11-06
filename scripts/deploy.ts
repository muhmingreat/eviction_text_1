import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
  const [acc1, acc2, acc3, acc4] = await hre.ethers.getSigners();
console.log(acc1)
  // Starting scripting
  
  const ERC20 = await hre.ethers.getContractFactory("NigerToken");
  console.log("Contract waiting for deployment");
  const erc20 = await ERC20.deploy(acc1);

//   console.log("Deploy contract to :", await erc20.getAddress());
  console.log("Token deployed:", erc20);
     console.log("Token deployed:", erc20.owner)

  const tokenContractAdrress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log(
    "######  Deploying the `TokenVesting` contract using the deployed ERC20 token's address ######"
  );

  const TokenVesting = await hre.ethers.getContractFactory("TokenVesting");

  const tokenVesting = await TokenVesting.deploy(tokenContractAdrress);

  console.log("tokenvesting deployed:", tokenVesting);

  const DEPLOYED_FACTORY_CONTRACT =
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const tokenVestingContractInstance = await hre.ethers.getContractAt(
    "TokenVesting",
    DEPLOYED_FACTORY_CONTRACT
  );

  console.log("###### Minting token to the contract address ######");
  const mintTokenToContract = await erc20
    .connect(acc1)
    .mint(
      tokenVestingContractInstance.getAddress(),
      hre.ethers.parseUnits("20000000", 18)
    );

  mintTokenToContract.wait();

  console.log(mintTokenToContract);

  console.log(
    "######  Adding a beneficiary to the `TokenVesting` contract with a vesting schedule ######"
  );

  const startTime = await time.latest();
  const duration = startTime + 60 - startTime;
  const totalAmount = hre.ethers.parseUnits("100000", 18);

  await time.increaseTo(startTime + 60);

  const addBeneficiary = await tokenVestingContractInstance
    .connect(acc1)
    .addBeneficiary(acc3, startTime, duration, totalAmount);

  addBeneficiary.wait();
  console.log(addBeneficiary);

  console.log(
    "##### Claim vested tokens for the beneficiary after advancing time #####"
  );

  await time.increaseTo(startTime + 4000);

  const claimVestedToken = await tokenVestingContractInstance
    .connect(acc4)
    .claimTokens();

  claimVestedToken.wait();
  console.log(claimVestedToken);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
