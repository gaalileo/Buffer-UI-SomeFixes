export const CONTRACTS = {
  421613: {
    LBFRfaucet: '0x6E65a4474d7cD2F8A31681fed0E740eFb261Ef51',
    LBFR: '0x73B845eEea2a392CcE565ee89A235261159E1104',
    LBFRrewardDistributor: '0xc24125470c0BEF1208c68228814d5D748015dAD9',
    LBFRrewardTracker: '0x16be3a1f310189c216Cd907367D73282330831c1',
  },
  42161: {
    LBFRfaucet: '',
    LBFR: '',
    LBFRrewardDistributor: '',
    LBFRrewardTracker: '',
  },
};

type typeChainId = keyof typeof CONTRACTS;
type typeContractName = keyof (typeof CONTRACTS)[42161];

export function getContract(chainId: number, name: typeContractName) {
  if (!CONTRACTS[chainId as typeChainId]) {
    throw new Error(`Unknown chainId ${chainId}`);
  }
  if (!CONTRACTS[chainId as typeChainId][name]) {
    throw new Error(`Unknown contract "${name}" for chainId ${chainId}`);
  }
  return CONTRACTS[chainId as typeChainId][name];
}
