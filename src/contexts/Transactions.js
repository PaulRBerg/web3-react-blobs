import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from "react";
import typy from "typy";

import { safeAccess } from "@sablier/utils";
import { useWeb3React } from "@sablier/react-hooks";

import { useBlockNumber } from "./Ethereum";

const RESPONSE = "response";
const CUSTOM_DATA = "CUSTOM_DATA";
const BLOCK_NUMBER_CHECKED = "BLOCK_NUMBER_CHECKED";
const RECEIPT = "receipt";

const ADD_TRANSACTION = "ADD_TRANSACTION";
const CHECK_TRANSACTION = "CHECK_TRANSACTION";
const FINALIZE_TRANSACTION = "FINALIZE_TRANSACTION";

const TransactionsContext = createContext();

function useTransactionsContext() {
  return useContext(TransactionsContext);
}

export function useAddTransaction() {
  const { chainId } = useWeb3React();
  const [, { addTransaction }] = useTransactionsContext();

  return useCallback(
    (response, customData = {}) => {
      if (typy(chainId).isFalsy && chainId !== 0) {
        throw Error(`Invalid chainId '${chainId}`);
      }

      if (typy(response, "hash").isFalsy) {
        throw Error("No transaction hash found.");
      }
      addTransaction(chainId, typy(response, "hash").safeString, { ...response, [CUSTOM_DATA]: customData });
    },
    [addTransaction, chainId],
  );
}

export function useAllTransactions() {
  const { chainId } = useWeb3React();
  const [state] = useTransactionsContext();

  return typy(state, chainId ? chainId.toString() : "").safeObjectOrEmpty;
}

export function usePendingApproval(tokenAddress) {
  const allTransactions = useAllTransactions();

  return (
    Object.keys(allTransactions).filter(hash => {
      if (allTransactions[hash][RECEIPT]) {
        return false;
      } else if (!allTransactions[hash][RESPONSE]) {
        return false;
      } else if (allTransactions[hash][RESPONSE][CUSTOM_DATA].approval !== tokenAddress) {
        return false;
      } else {
        return true;
      }
    }).length >= 1
  );
}

export function useHasPendingTransactions() {
  const transactions = useAllTransactions();

  const hasPendingTxs = useMemo(() => {
    const pendingTxs = Object.keys(transactions).filter(hash => !transactions[hash].receipt);
    return pendingTxs.length > 0;
  }, [transactions]);

  return hasPendingTxs;
}

function reducer(state, { type, payload }) {
  switch (type) {
    case ADD_TRANSACTION: {
      const { chainId, hash, response } = payload;

      if (safeAccess(state, [chainId, hash]) !== null) {
        throw Error("Attempted to add existing transaction.");
      }

      return {
        ...state,
        [chainId]: {
          ...(safeAccess(state, [chainId]) || {}),
          [hash]: {
            [RESPONSE]: response,
          },
        },
      };
    }
    case CHECK_TRANSACTION: {
      const { chainId, hash, blockNumber } = payload;

      if (safeAccess(state, [chainId, hash]) === null) {
        throw Error("Attempted to check non-existent transaction.");
      }

      return {
        ...state,
        [chainId]: {
          ...(safeAccess(state, [chainId]) || {}),
          [hash]: {
            ...(safeAccess(state, [chainId, hash]) || {}),
            [BLOCK_NUMBER_CHECKED]: blockNumber,
          },
        },
      };
    }
    case FINALIZE_TRANSACTION: {
      const { chainId, hash, receipt } = payload;

      if (safeAccess(state, [chainId, hash]) === null) {
        throw Error("Attempted to finalize non-existent transaction.");
      }

      return {
        ...state,
        [chainId]: {
          ...(safeAccess(state, [chainId]) || {}),
          [hash]: {
            ...(safeAccess(state, [chainId, hash]) || {}),
            [RECEIPT]: receipt,
          },
        },
      };
    }
    default: {
      throw Error(`Unexpected action type in TransactionsContext reducer: '${type}'.`);
    }
  }
}

export function TransactionsContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {});

  const addTransaction = useCallback((chainId, hash, response) => {
    dispatch({ type: ADD_TRANSACTION, payload: { chainId, hash, response } });
  }, []);
  const checkTransaction = useCallback((chainId, hash, blockNumber) => {
    dispatch({ type: CHECK_TRANSACTION, payload: { chainId, hash, blockNumber } });
  }, []);
  const finalizeTransaction = useCallback((chainId, hash, receipt) => {
    dispatch({ type: FINALIZE_TRANSACTION, payload: { chainId, hash, receipt } });
  }, []);

  return (
    <TransactionsContext.Provider
      value={useMemo(() => [state, { addTransaction, checkTransaction, finalizeTransaction }], [
        addTransaction,
        checkTransaction,
        finalizeTransaction,
        state,
      ])}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function TransactionsContextUpdater() {
  const { chainId, library } = useWeb3React();
  const globalBlockNumber = useBlockNumber();
  const [state, { checkTransaction, finalizeTransaction }] = useTransactionsContext();

  const allTransactions = safeAccess(state, [chainId]) || {};

  useEffect(() => {
    if (typy(chainId).isFalsy || chainId === 0 || typy(library).isFalsy) {
      return undefined;
    }
    let stale = false;
    Object.keys(allTransactions)
      .filter(
        hash => !allTransactions[hash][RECEIPT] && allTransactions[hash][BLOCK_NUMBER_CHECKED] !== globalBlockNumber,
      )
      .forEach(async hash => {
        try {
          const receipt = await library.getTransactionReceipt(hash);
          if (!stale) {
            if (!receipt) {
              checkTransaction(chainId, hash, globalBlockNumber);
            } else {
              finalizeTransaction(chainId, hash, receipt);
            }
          }
        } catch {
          checkTransaction(chainId, hash, globalBlockNumber);
        }
      });
    return () => {
      stale = true;
    };
  }, [allTransactions, chainId, checkTransaction, finalizeTransaction, library, globalBlockNumber]);

  return null;
}
