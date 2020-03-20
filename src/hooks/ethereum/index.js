import { useEffect, useState } from "react";
import typy from "typy";

import { injected } from "@sablier/connectors";
import { isMobile } from "react-device-detect";
import { useWeb3React as useWeb3ReactCore } from "@web3-react/core";

import { useWeb3React } from "./web3React";

export function useAddressFromENSName(ENSName) {
  const { library } = useWeb3React();

  const [addressFromENSName, setAddressFromENSName] = useState(ENSName);

  useEffect(() => {
    const controller = new AbortController();
    if (typy(ENSName).isTruthy) {
      if (typy(ENSName).isEthereumAddress) {
        /** If it already is a valid 0x address, no need to resolve it */
        setAddressFromENSName(ENSName);
      } else if (typy(ENSName).isENSAddress) {
        /** If it is an ENS address, try to resolve it */
        library
          .resolveName(ENSName)
          .then(address => {
            if (!controller.signal.aborted) {
              if (address) {
                setAddressFromENSName(address);
              } else {
                throw new Error("Resolver couldn't find the address.");
              }
            }
          })
          .catch(e => {
            console.error(e);
            setAddressFromENSName(undefined);
          });
      } else {
        setAddressFromENSName(undefined);
      }
      /** Input identifier was not supported */
    } else {
      setAddressFromENSName(undefined);
    }
    /** Input identifier was missing */
    return () => {
      controller.abort();
    };
  }, [library, ENSName]);

  return addressFromENSName;
}

export function useENSName(address) {
  const { library } = useWeb3React();

  const [ENSName, setENSName] = useState();

  useEffect(() => {
    if (typy(address).isEthereumAddress) {
      let stale = false;

      library
        .lookupAddress(address)
        .then(name => {
          if (!stale) {
            if (name) {
              setENSName(name);
            } else {
              setENSName(null);
            }
          }
        })
        .catch(() => {
          if (!stale) {
            setENSName(null);
          }
        });

      return () => {
        stale = true;
        setENSName();
      };
    }

    return undefined;
  }, [library, address]);

  return ENSName;
}

export function useEagerConnect() {
  /* Specifically using useWeb3React because of what this Hook does */
  const { activate, active } = useWeb3ReactCore();

  const [tried, setTried] = useState(false);

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        if (isMobile && typy(window, "ethereum").isTruthy) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      }
    });
  }, [activate]); /* Intentionally only running on mount (make sure it's only mounted once :)) */

  /* If the connection worked, wait until we get confirmation of that to flip the flag */
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}

/* Use for network and injected connectors - logs user in and out after checking what chain they're on */
export function useInactiveListener(suppress = false) {
  /* Specifically using useWeb3React because of what this Hook does */
  const { activate, active, error } = useWeb3ReactCore();

  useEffect(() => {
    const ethereum = typy(window, "ethereum").safeObject;
    if (typy(ethereum).isFalsy) {
      return undefined;
    }

    if (typy(ethereum, "on").isTruthy && !active && typy(error).isFalsy && !suppress) {
      const handleChainChanged = () => {
        /* Eat errors */
        activate(injected, undefined, true).catch(() => {});
      };

      const handleNetworkChanged = () => {
        /* Eat errors */
        activate(injected, undefined, true).catch(() => {});
      };

      const handleAccountsChanged = accounts => {
        if (accounts.length > 0) {
          /* Eat errors */
          activate(injected, undefined, true).catch(() => {});
        }
      };

      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("networkChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (typy(ethereum, "removeListener").isTruthy) {
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("networkChanged", handleNetworkChanged);
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }

    return undefined;
  }, [activate, active, error, suppress]);
}

export * from "./contracts";
export * from "./web3React";
