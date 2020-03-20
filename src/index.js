import React from "react";
import ReactDOM from "react-dom";
import ThemeProvider, { GlobalStyle } from "@sablier/theme";

import {
  EthereumContextProvider,
  EthereumContextUpdater,
  ModalsContextProvider,
  TokensContextProvider,
  TransactionsContextProvider,
  TransactionsContextUpdater,
} from "@sablier/contexts";
import { NETWORK_CONTEXT_NAME } from "@sablier/dev-constants";
import { Web3ReactProvider, createWeb3ReactRoot } from "@web3-react/core";
import { ethers } from "ethers";

import App from "./pages/App";

import "@sablier/utils/lib/bignumber";
import "@sablier/utils/lib/i18n";
import "@sablier/vendors/lib/rollbar";
import "@sablier/utils/lib/types";

const Web3ProviderNetwork = createWeb3ReactRoot(NETWORK_CONTEXT_NAME);
ethers.errors.setLogLevel("error");

function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 10000;
  return library;
}

function ContextProviders({ children }) {
  return (
    <EthereumContextProvider>
      <TransactionsContextProvider>
        <TokensContextProvider>
          <ModalsContextProvider>{children}</ModalsContextProvider>
        </TokensContextProvider>
      </TransactionsContextProvider>
    </EthereumContextProvider>
  );
}

function Updaters() {
  return (
    <>
      <EthereumContextUpdater />
      <TransactionsContextUpdater />
    </>
  );
}

ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <Web3ProviderNetwork getLibrary={getLibrary}>
      <ContextProviders>
        <Updaters />
        <ThemeProvider>
          <>
            <GlobalStyle />
            <App />
          </>
        </ThemeProvider>
      </ContextProviders>
    </Web3ProviderNetwork>
  </Web3ReactProvider>,
  document.getElementById("root"),
);
