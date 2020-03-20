import { NETWORK_CONTEXT_NAME } from "@sablier/dev-constants";
import { useWeb3React as useWeb3ReactCore } from "@web3-react/core";

export function useWeb3React() {
  const context = useWeb3ReactCore();
  const contextNetwork = useWeb3ReactCore(NETWORK_CONTEXT_NAME);

  return context.active ? context : contextNetwork;
}
