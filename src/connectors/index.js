import { DOMAINS, GOERLI_ID, KOVAN_ID, MAINNET_ID, RINKEBY_ID, ROPSTEN_ID } from "@sablier/dev-constants";
import { InjectedConnector } from "@web3-react/injected-connector";
import { PortisConnector } from "@web3-react/portis-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { colors } from "@sablier/theme";

import { FortmaticConnector } from "./Fortmatic";
import { NetworkConnector } from "./Network";

const POLLING_INTERVAL = 10000;

export const fortmatic = new FortmaticConnector({
  apiKey: process.env.REACT_APP_FORTMATIC_KEY,
  chainId: process.env.REACT_APP_NODE_ENV === "production" ? MAINNET_ID : RINKEBY_ID,
});

export const injected = new InjectedConnector({
  supportedChainIds: [GOERLI_ID, KOVAN_ID, MAINNET_ID, RINKEBY_ID, ROPSTEN_ID],
});

/**
 * We always connect to mainnet since we rely on the subgraph for testnet data. In fact, we kept this
 * connector only because we followed the Uniswap codebase and removing may have 2nd order effects.
 * See https://github.com/NoahZinsmeister/web3-react/issues/35#issuecomment-557791111
 */
export const network = new NetworkConnector({
  pollingInterval: POLLING_INTERVAL,
  urls: { [MAINNET_ID]: process.env.REACT_APP_MAINNET_URL },
});

export const portis = new PortisConnector({
  dAppId: process.env.REACT_APP_PORTIS_KEY,
  networks: [MAINNET_ID],
});

export const walletconnect = new WalletConnectConnector({
  bridge: "https://bridge.walletconnect.org",
  qrcode: false,
  pollingInterval: POLLING_INTERVAL,
  rpc: { [MAINNET_ID]: process.env.REACT_APP_MAINNET_URL },
});

export const walletlink = new WalletLinkConnector({
  appLogoUrl: DOMAINS.finance + "/icon.png",
  appName: "Sablier",
  url: process.env.REACT_APP_MAINNET_URL,
});

/* Heads up: don't order alphabetically here, because this is the order in which the wallets are shown to the user */
export const SUPPORTED_WALLETS = {
  INJECTED: {
    color: colors.registrationBlack,
    connector: injected,
    description: "modals.wallet.injectedWeb3Provider",
    href: null,
    icon: require("@sablier/assets/svg/arrow-right.svg"),
    id: "Injected",
    name: "words.injected",
    primary: true,
  },
  METAMASK: {
    color: colors.carrotOrange,
    connector: injected,
    description: "modals.wallet.metamask.description",
    href: null,
    id: "MetaMask",
    icon: require("@sablier/assets/images/icon-metamask.png"),
    name: "words.metamask",
  },
  WALLET_CONNECT: {
    color: "#4196fc",
    connector: walletconnect,
    description: "modals.wallet.walletConnect.description",
    href: null,
    icon: require("@sablier/assets/svg/wallet-connect-icon.svg"),
    id: "WalletConnect",
    name: "structs.walletConnect",
  },
  WALLET_LINK: {
    color: "#315cf5",
    connector: walletlink,
    description: "modals.wallet.coinbaseWallet.description",
    href: null,
    icon: require("@sablier/assets/svg/coinbase-wallet-icon.svg"),
    id: "WalletLink",
    name: "structs.coinbaseWallet",
  },
  FORTMATIC: {
    connector: fortmatic,
    description: "modals.wallet.fortmatic.description",
    href: null,
    icon: require("@sablier/assets/images/fortmatic-icon.png"),
    color: colors.veryLightBlue,
    mobile: true,
    name: "words.fortmatic",
  },
  PORTIS: {
    color: colors.queenBlue,
    connector: portis,
    description: "modals.wallet.portis.description",
    href: null,
    icon: require("@sablier/assets/images/portis-icon.png"),
    mobile: true,
    name: "words.portis",
  },
  /** Mobile only **/
  COINBASE_WALLET: {
    color: "#315cf5",
    description: "modals.wallet.coinbaseWallet.description",
    href: "https://go.cb-w.com/l6TB3irDk2",
    icon: require("@sablier/assets/svg/coinbase-wallet-icon.svg"),
    mobile: true,
    mobileOnly: true,
    name: "modals.wallet.coinbaseWallet.title",
  },
  TRUST_WALLET: {
    color: "#1c74cc",
    description: "modals.wallet.trustWallet.description",
    href: "https://link.trustwallet.com/open_url?coin_id=60&url=" + DOMAINS.finance,
    icon: require("@sablier/assets/images/trust-wallet-icon.png"),
    mobile: true,
    mobileOnly: true,
    name: "modals.wallet.trustWallet.title",
  },
};
