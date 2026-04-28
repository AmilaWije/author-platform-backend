import { ethers } from 'ethers';
// import * as LockArtifact from '../artifacts/contracts/Lock.sol/PublishingAgreement.json';
// const abi = LockArtifact.abi;
import PublishingAgreementArtifact from '../artifacts/contracts/Lock.sol/PublishingAgreement.json';
import { validateHeaderValue } from 'http';

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
const abi = PublishingAgreementArtifact.abi;

export const deployContract = async (
  authorAddress: string,
  authorPriKey: string,
  publisherAddress: string,
  publisherPriKey: string,
  duration: string,
  amount: bigint,
) => {
  console.log('Author:', authorAddress);
  console.log('Publisher:', publisherAddress);
  console.log('Duration:', duration);
  const privateKey = publisherPriKey;
  const wallet = new ethers.Wallet(privateKey, provider);
  // bytecode (from compiled contract)
  const bytecode = PublishingAgreementArtifact.bytecode;
  // const abi = PublishingAgreementArtifact.abi;

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const contract = await factory.deploy(
    authorAddress,
    publisherAddress,
    BigInt(duration),
    amount,
    {
      value: amount,
    },
  );

  await contract.waitForDeployment();

  return contract.target;
};

// export const releaseFunds = async (contractAddress: string) => {
//   const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

//   const contract = new ethers.Contract(contractAddress, abi, wallet);

//   const tx = await contract.releaseFunds();

//   await tx.wait();

//   return tx.hash;
// };

export const releaseFunds = async (contractAddress: string) => {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  // 🔍 Read contract state first
  const isPaid = await contract.isPaid();
  const isReleased = await contract.isReleased();
  const endTime = await contract.endTime();

  const block = await provider.getBlock('latest');
  const currentTime = Number(block?.timestamp);
  // const currentTime = Math.floor(Date.now() / 1000);

  console.log('isPaid:', isPaid);
  console.log('isReleased:', isReleased);
  console.log('--endTime:', endTime.toString());
  console.log('currentTime:', currentTime);

  // 🚫 Prevent revert errors
  if (!isPaid) {
    throw new Error('Payment not done');
  }

  if (isReleased) {
    throw new Error('Already released');
  }

  if (currentTime < Number(endTime)) {
    throw new Error('Agreement not expired yet');
  }

  // ✅ Safe to call now
  const tx = await contract.releaseFunds();

  await tx.wait();

  return tx.hash;
};

export const payAgreement = async (
  contractAddress: string,
  privateKey: string,
  amount: string,
) => {
  console.log(contractAddress);
  console.log(privateKey);
  console.log(amount);
  const wallet = new ethers.Wallet(privateKey, provider);

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  console.log('Calling pay...');
  console.log('Amount:', amount);
  console.log('Contract:', contractAddress);
  console.log('Wallet:', wallet.address);

  const balance = await provider.getBalance(contractAddress);
  console.log(ethers.formatEther(balance));

  try {
    const tx = await contract.pay({
      value: ethers.parseEther(amount),
    });

    await tx.wait();
    console.log('Payment success:', tx.hash);
    return tx.hash;
  } catch (e) {
    console.error('Payment failed:', e);
  }
};
