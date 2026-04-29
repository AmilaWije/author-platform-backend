import { ethers } from 'ethers';
import PublishingAgreementArtifact from '../artifacts/contracts/Lock.sol/PublishingAgreement.json';

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
const abi = PublishingAgreementArtifact.abi;

export const deployContract = async (
  authorAddress: string,
  authorPriKey: string,
  publisherAddress: string,
  publisherPriKey: string,
  duration: string,
  amount: bigint,
  authorShare: number = 70,
) => {
  console.log('Author:', authorAddress);
  console.log('Publisher:', publisherAddress);
  console.log('Duration:', duration);
  console.log('Author Share:', authorShare + '%');
  const privateKey = publisherPriKey;
  const wallet = new ethers.Wallet(privateKey, provider);
  const bytecode = PublishingAgreementArtifact.bytecode;

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const contract = await factory.deploy(
    authorAddress,
    publisherAddress,
    BigInt(duration),
    amount,
    authorShare,
    {
      value: amount,
    },
  );

  await contract.waitForDeployment();

  return contract.target;
};

export const advanceBlockchainTime = async (seconds: number) => {
  await provider.send('evm_increaseTime', [seconds]);
  await provider.send('evm_mine', []);
};

export const releaseFunds = async (contractAddress: string, privateKey?: string) => {
  const key = privateKey || process.env.PRIVATE_KEY!;
  const wallet = new ethers.Wallet(key, provider);

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  const isReleased = await contract.isReleased();
  const endTime = await contract.endTime();
  const author = await contract.author();
  const publisher = await contract.publisher();

  const block = await provider.getBlock('latest');
  const currentTime = Number(block?.timestamp);

  const getBalance = async (addr: string) => {
    const result = await provider.send('eth_getBalance', [addr, 'latest']);
    return ethers.formatEther(result);
  };

  console.log('--- releaseFunds Debug ---');
  console.log('Caller wallet:', wallet.address);
  console.log('Contract address:', contractAddress);
  console.log('Author:', author);
  console.log('Publisher:', publisher);
  console.log('Contract balance:', await getBalance(contractAddress), 'ETH');
  console.log('Author balance (before):', await getBalance(author), 'ETH');
  console.log('Publisher balance (before):', await getBalance(publisher), 'ETH');
  console.log('isReleased:', isReleased);
  console.log('endTime:', endTime.toString());
  console.log('currentTime:', currentTime);

  if (isReleased) {
    throw new Error('Already released');
  }

  if (currentTime < Number(endTime)) {
    const secondsToAdvance = Number(endTime) - currentTime;
    console.log(`Advancing Ganache clock by ${secondsToAdvance} seconds`);
    await advanceBlockchainTime(secondsToAdvance);
  }

  const tx = await contract.releaseFunds();
  const receipt = await tx.wait();

  if (receipt!.status !== 1) {
    throw new Error('releaseFunds transaction reverted');
  }

  // Force mine a fresh block so provider returns updated values
  await provider.send('evm_mine', []);

  console.log('Author balance (after):', await getBalance(author), 'ETH');
  console.log('Publisher balance (after):', await getBalance(publisher), 'ETH');
  console.log('Contract balance (after):', await getBalance(contractAddress), 'ETH');
  console.log('--- releaseFunds Complete ---');

  return receipt!.hash;
};

export const payAgreement = async (
  contractAddress: string,
  privateKey: string,
  amount: string,
) => {
  const wallet = new ethers.Wallet(privateKey, provider);

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  console.log('Amount:', amount);
  console.log('Contract:', contractAddress);
  console.log('Wallet:', wallet.address);

  const balance = await provider.getBalance(contractAddress);
  console.log(ethers.formatEther(balance));

  try {
    const tx = await contract.payAgreement({
      value: ethers.parseEther(amount),
    });

    await tx.wait();
    console.log('Payment success:', tx.hash);
    return tx.hash;
  } catch (e) {
    console.error('Payment failed:', e);
    throw e;
  }
};
