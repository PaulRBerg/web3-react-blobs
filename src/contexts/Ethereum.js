import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import typy from "typy";

import { safeAccess } from "@sablier/utils";
import { useWeb3React } from "@sablier/react-hooks";

const BLOCK_NUMBER = "BLOCK_NUMBER";
const UPDATE_BLOCK_NUMBER = "UPDATE_BLOCK_NUMBER";

const INITIAL_ETHEREUM_CONTEXT = {
  [BLOCK_NUMBER]: {},
};

/* TODO: maybe rename this? we already have Web3Provider */
const EthereumContext = createContext();

function useEthereumContext() {
  return useContext(EthereumContext);
}

export function useBlockNumber() {
  const { chainId } = useWeb3React();

  const [state] = useEthereumContext();

  return safeAccess(state, [BLOCK_NUMBER, chainId]);
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_BLOCK_NUMBER: {
      const { chainId, blockNumber } = payload;
      return {
        ...state,
        [BLOCK_NUMBER]: {
          ...typy(state, BLOCK_NUMBER).safeObjectOrEmpty,
          [chainId]: blockNumber,
        },
      };
    }
    default: {
      throw new Error(`Unexpected action type in EthereumContext reducer: '${type}'.`);
    }
  }
}

export function EthereumContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_ETHEREUM_CONTEXT);

  const updateBlockNumber = useCallback((chainId, blockNumber) => {
    dispatch({ type: UPDATE_BLOCK_NUMBER, payload: { chainId, blockNumber } });
  }, []);

  return (
    <EthereumContext.Provider value={useMemo(() => [state, { updateBlockNumber }], [state, updateBlockNumber])}>
      {children}
    </EthereumContext.Provider>
  );
}

export function EthereumContextUpdater() {
  const { chainId, library } = useWeb3React();

  const [, { updateBlockNumber }] = useEthereumContext();

  /* Update block number */
  useEffect(() => {
    let stale = false;

    async function update() {
      try {
        const blockNumber = await library.getBlockNumber();
        if (!stale) {
          updateBlockNumber(chainId, blockNumber);
        }
      } catch {
        if (!stale) {
          updateBlockNumber(chainId, null);
        }
      }
    }

    if (typy(library).isTruthy) {
      update();
      library.on("block", update);

      return () => {
        stale = true;
        library.removeListener("block", update);
      };
    }

    return undefined;
  }, [chainId, library, updateBlockNumber]);

  return null;
}
