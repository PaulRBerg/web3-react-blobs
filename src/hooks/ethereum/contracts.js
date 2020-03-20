import { useMemo } from "react";
import CTOKEN_MANAGER_ABI from "@sablier/dev-constants/lib/abis/CTokenManager";
import ERC20_ABI from "@sablier/dev-constants/lib/abis/Erc20";
import PAYROLL_ABI from "@sablier/dev-constants/lib/abis/Payroll";
import SABLIER_ABI from "@sablier/dev-constants/lib/abis/Sablier";

import { CTOKEN_MANAGER_ADDRESSES, PAYROLL_ADDRESSES, SABLIER_ADDRESSES } from "@sablier/dev-constants";
import { getContract } from "@sablier/utils";

import { useWeb3React } from "./web3React";

/* Returns null on errors */
export function useContract({ abi, address, withSignerIfPossible = true }) {
  const { account, library } = useWeb3React();

  return useMemo(() => {
    try {
      return getContract({ abi, account: withSignerIfPossible ? account : undefined, address, library });
    } catch {
      return null;
    }
  }, [abi, account, address, library, withSignerIfPossible]);
}

export function useCTokenManagerContract(withSignerIfPossible = true) {
  const { chainId } = useWeb3React();
  return useContract({ abi: CTOKEN_MANAGER_ABI, address: CTOKEN_MANAGER_ADDRESSES[chainId], withSignerIfPossible });
}

export function usePayrollContract(withSignerIfPossible = true) {
  const { chainId } = useWeb3React();
  return useContract({ abi: PAYROLL_ABI, address: PAYROLL_ADDRESSES[chainId], withSignerIfPossible });
}

export function useSablierContract(withSignerIfPossible = true) {
  const { chainId } = useWeb3React();
  return useContract({ abi: SABLIER_ABI, address: SABLIER_ADDRESSES[chainId], withSignerIfPossible });
}

export function useTokenContract({ tokenAddress, withSignerIfPossible = true }) {
  return useContract({ abi: ERC20_ABI, address: tokenAddress, withSignerIfPossible });
}
