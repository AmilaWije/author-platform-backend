import { ethers } from 'ethers';
// import * as LockArtifact from '../artifacts/contracts/Lock.sol/PublishingAgreement.json';
// const abi = LockArtifact.abi;
import PublishingAgreementArtifact from '../artifacts/contracts/Lock.sol/PublishingAgreement.json';

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

export const deployContract = async (
  authorAddress: string,
  publisherAddress: string,
  duration: bigint,
) => {
  console.log('Author:', authorAddress);
  console.log('Publisher:', publisherAddress);
  console.log('Duration:', duration);
  const privateKey = process.env.PRIVATE_KEY!;
  const wallet = new ethers.Wallet(privateKey, provider);
  // bytecode (from compiled contract)
  const bytecode = PublishingAgreementArtifact.bytecode;
  const abi = PublishingAgreementArtifact.abi;

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const contract = await factory.deploy(
    authorAddress,
    publisherAddress,
    duration
  );

  await contract.waitForDeployment();

  return contract.target;
};
