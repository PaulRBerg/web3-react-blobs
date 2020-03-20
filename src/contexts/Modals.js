import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";

const GO_TO_MODAL = "GO_TO_MODAL";
const OPTIONS_MODAL = "OPTIONS_MODAL";
const PROCESSING_MODAL = "PROCESSING_MODAL";
const WALLET_MODAL = "WALLET_MODAL";
const WALLET_MODAL_ERROR = "WALLET_MODAL_ERROR";

const UPDATE_KEY = "UPDATE_KEY";
const UPDATABLE_KEYS = [GO_TO_MODAL, OPTIONS_MODAL, PROCESSING_MODAL, WALLET_MODAL, WALLET_MODAL_ERROR];

const INITIAL_MODALS_CONTEXT = {
  [GO_TO_MODAL]: false,
  [OPTIONS_MODAL]: false,
  [PROCESSING_MODAL]: false,
  [WALLET_MODAL]: false,
  [WALLET_MODAL_ERROR]: null,
};

const ModalsContext = createContext();

function useModalsContext() {
  return useContext(ModalsContext);
}

export function useGoToModalManager() {
  const [state, { updateKey }] = useModalsContext();

  const isOpen = state[GO_TO_MODAL];
  const toggle = useCallback(() => {
    updateKey(GO_TO_MODAL, !isOpen);
  }, [isOpen, updateKey]);

  return {
    isOpen,
    toggle,
  };
}

export function useLinksModalManager() {
  const [state, { updateKey }] = useModalsContext();

  const isOpen = state[OPTIONS_MODAL];
  const toggle = useCallback(() => {
    updateKey(OPTIONS_MODAL, !isOpen);
  }, [isOpen, updateKey]);

  return {
    isOpen,
    toggle,
  };
}

export function useProcessingModalManager() {
  const [state, { updateKey }] = useModalsContext();

  const isOpen = state[PROCESSING_MODAL];
  const toggle = useCallback(() => {
    updateKey(PROCESSING_MODAL, !isOpen);
  }, [isOpen, updateKey]);

  return {
    isOpen,
    toggle,
  };
}

export function useWalletModalManager() {
  const [state, { updateKey }] = useModalsContext();

  const isOpen = state[WALLET_MODAL];
  const error = state[WALLET_MODAL_ERROR];

  /* "newError" must be a string */
  const setError = useCallback(
    newError => {
      updateKey(WALLET_MODAL_ERROR, newError);
    },
    [updateKey],
  );

  const toggle = useCallback(() => {
    updateKey(WALLET_MODAL, !isOpen);
  }, [isOpen, updateKey]);

  return {
    error,
    isOpen,
    setError,
    toggle,
  };
}

export function useModalManager() {
  const { isOpen: isGoToModalOpen } = useGoToModalManager();
  const { isOpen: isProcessingModalOpen } = useProcessingModalManager();
  const { isOpen: isLinksModalOpen } = useLinksModalManager();
  const { isOpen: isWalletModalOpen } = useWalletModalManager();
  const isAnyModalOpen = isGoToModalOpen || isLinksModalOpen || isProcessingModalOpen || isWalletModalOpen;
  return { isAnyModalOpen };
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_KEY: {
      const { key, value } = payload;
      if (!UPDATABLE_KEYS.some(k => k === key)) {
        throw new Error(`Unexpected key in ModalsContext reducer: '${key}'.`);
      } else {
        return {
          ...state,
          [key]: value,
        };
      }
    }
    default: {
      throw new Error(`Unexpected action type in ModalsContext reducer: '${type}'.`);
    }
  }
}

/**
 * TODO: figure out a better naming. The context providers that handle the unique modals for each app
 * will have overlapping names with this.
 */
export function ModalsContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_MODALS_CONTEXT);

  const updateKey = useCallback((key, value) => {
    dispatch({ type: UPDATE_KEY, payload: { key, value } });
  }, []);

  return (
    <ModalsContext.Provider value={useMemo(() => [state, { updateKey }], [state, updateKey])}>
      {children}
    </ModalsContext.Provider>
  );
}
