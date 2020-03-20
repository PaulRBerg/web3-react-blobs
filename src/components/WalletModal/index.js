import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import typy from "typy";

import { SUPPORTED_WALLETS, fortmatic, injected, portis, walletconnect } from "@sablier/connectors";
import { OVERLAY_READY } from "@sablier/connectors/lib/Fortmatic";
import { URI_AVAILABLE } from "@web3-react/walletconnect-connector";
import { TopRightCloseIcon, Link, colors } from "@sablier/theme";
import { isMobile } from "react-device-detect";
import { usePrevious } from "@sablier/react-hooks";
import { useTranslation } from "react-i18next";
import { useWalletModalManager } from "@sablier/contexts";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";

import AccountDetails from "./AccountDetails";
import Modal from "../Modal";
import Option from "./Option";
import PendingView from "./PendingView";

const StyledModal = styled(Modal)`
  user-select: none;
`;

const OuterWrapper = styled.div`
  ${props => props.theme.flexColumnNoWrap};
  background-color: ${props => props.theme.white};
  margin: 0rem;
  padding: 0rem;
  width: 100%;
`;

const InnerWrapper = styled.div`
  background-color: ${props => props.theme.snowWhite};
  position: relative;

  h5 {
    font-size: 1rem;
    font-weight: 400;
    margin: 0rem;
    margin-bottom: 0.5rem;
  }

  h5:last-child {
    margin-bottom: 0rem;
  }

  h4 {
    font-weight: 500;
    margin-top: 0rem;
  }
`;

const TitleLabel = styled.h4`
  ${props => props.theme.flexRowNoWrap};
  font-size: 1.1875rem;
  font-weight: 500;
  margin: 0rem;
  padding: 1.5rem;
  text-transform: capitalize;

  ${props => props.theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`;

const HoverLabel = styled.div`
  text-transform: capitalize;

  &:active,
  &:hover {
    cursor: pointer;
  }
`;

const ContentWrapper = styled.div`
  background-color: ${props => props.theme.white};
  padding: 2rem;
  ${props => props.theme.mediaWidth.upToMedium`
    padding: 1rem
  `};
`;

const Blurb = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  margin-top: 2rem;

  & a {
    color: ${props => props.theme.bleuDeFranceBlue};
  }

  ${props => props.theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`;

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 0.6125rem;
  grid-template-columns: 1fr 1fr;
  margin-top: 0.25rem;

  ${props => props.theme.mediaWidth.upToMedium`
    grid-gap: 0.6125rem;
    grid-template-columns: 1fr;
  `};
`;

const WALLET_VIEWS = Object.freeze({
  account: "account",
  options: "options",
  optionsSecondary: "optionsSecondary",
  pending: "pending",
});

const DIALOG_LABEL_ID = "wallet-modal-label";

export default function WalletModal() {
  const { activate, active, account, connector, error } = useWeb3React();
  const { t: translation } = useTranslation();

  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  const [pendingError, setPendingError] = useState();
  const [pendingWallet, setPendingWallet] = useState();
  const [uri, setUri] = useState();
  const [walletView, setWalletView] = useState(WALLET_VIEWS.account);
  const { isOpen: isWalletModalOpen, toggle: toggleWalletModal } = useWalletModalManager();

  /** Callbacks **/

  const tryActivation = useCallback(
    async connectorToActivate => {
      let name = "";
      Object.keys(SUPPORTED_WALLETS).map(key => {
        if (connectorToActivate === SUPPORTED_WALLETS[key].connector) {
          name = translation(SUPPORTED_WALLETS[key].name);
        }
        return true;
      });

      /* Set wallet for pending view */
      setPendingWallet(connectorToActivate);
      setWalletView(WALLET_VIEWS.pending);
      activate(connectorToActivate, undefined, true).catch(connectorError => {
        if (connectorError instanceof UnsupportedChainIdError) {
          activate(connectorToActivate); /* a little janky...can't use setError because the connector isn't set */
        } else {
          setPendingError(true);
        }
      });
    },
    [activate, translation],
  );

  /** Side Effects **/

  /* Always reset to account view */
  useEffect(() => {
    if (isWalletModalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.account);
    }
  }, [isWalletModalOpen]);

  /* Set up uri listener for walletconnect */
  useEffect(() => {
    const activateWC = newUri => {
      setUri(newUri);
    };

    walletconnect.on(URI_AVAILABLE, activateWC);
    return () => {
      walletconnect.off(URI_AVAILABLE, activateWC);
    };
  }, []);

  /**
   * Close wallet modal if fortmatic modal is active
   * Warning: without this, we get this effing bug: https://imgur.com/a/iGap2UL
   */
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal();
    });
  }, [toggleWalletModal]);

  /* TODO: Find a smarter, less janky way to do this */
  useEffect(() => {
    const isFreshlyActive = active && !activePrevious;
    const isFreshlyConnected = typy(connector).isTruthy && connector !== connectorPrevious && typy(error).isFalsy;
    if (isWalletModalOpen && (isFreshlyActive || isFreshlyConnected)) {
      setWalletView(WALLET_VIEWS.account);
    }
  }, [active, activePrevious, connector, connectorPrevious, error, isWalletModalOpen, setWalletView]);

  /* Get wallets user can switch too, depending on device/browser */
  const renderOptions = useCallback(() => {
    const isEthereumFalsy = typy(window, "ethereum").isFalsy;
    const isWeb3Falsy = typy(window, "web3").isFalsy;
    const isMetaMask = typy(window, "ethereum").isTruthy && typy(window, "ethereum.isMetaMask").isTruthy;

    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key];

      /* Check for mobile options */
      if (isMobile) {
        /* Disable portis on mobile for now */
        if (option.connector === portis) {
          return null;
        }

        if (isEthereumFalsy && isWeb3Falsy && typy(option, "mobile").isTrue) {
          return (
            <Option
              color={option.color}
              isActive={option.connector && option.connector === connector}
              key={key}
              link={option.href}
              icon={option.icon}
              onClick={() => {
                return (
                  option.connector !== connector && typy(option, "href").isFalsy && tryActivation(option.connector)
                );
              }}
              title={translation(option.name)}
              subtitle={null}
            />
          );
        } else {
          return null;
        }
      }

      /* Overwrite injected when needed */
      if (option.connector === injected) {
        /* Don't show injected if there's no injected provider */
        if (isWeb3Falsy && isEthereumFalsy) {
          if (option.name === "words.metamask") {
            return (
              <Option
                key={key}
                color={colors.carrotOrange}
                link="https://metamask.io"
                icon={require("@sablier/assets/images/icon-metamask.png")}
                subtitle={null}
                title={translation("modals.wallet.metamask.title")}
              />
            );
          } else {
            /* Don't want to return install twice */
            return null;
          }
        } else if (option.name === "words.metamask" && !isMetaMask) {
          /* Don't return metamask if injected provider isn't metamask */
          return null;
        } else if (option.name === "words.injected" && isMetaMask) {
          /* Likewise for generic */
          return null;
        }
      }

      /* Rest of options */
      if (isMobile || typy(option, "mobileOnly").isTrue) {
        return null;
      } else {
        return (
          <Option
            color={option.color}
            key={key}
            icon={option.icon}
            isActive={option.connector === connector}
            link={option.href}
            onClick={() => {
              return option.connector === connector
                ? setWalletView(WALLET_VIEWS.account)
                : typy(option, "href").isFalsy && tryActivation(option.connector);
            }}
            subtitle={null} /* Use option.description to bring back multi-line */
            title={translation(option.name)}
          />
        );
      }
    });
  }, [connector, tryActivation, translation]);

  const render = useCallback(() => {
    if (typy(error).isTruthy) {
        error: typy(error, "toString").isFunction ? error.toString() : error,
      });
      return (
        <InnerWrapper>
          <TopRightCloseIcon onClick={toggleWalletModal} />
          <TitleLabel>
            {error instanceof UnsupportedChainIdError
              ? translation("words.wrong") + " " + translation("words.network")
              : translation("words.error")}
          </TitleLabel>
          <ContentWrapper>
            {error instanceof UnsupportedChainIdError ? (
              <h5>{translation("modals.wallet.pleaseConnect")}</h5>
            ) : (
              translation("structs.unknownError")
            )}
          </ContentWrapper>
        </InnerWrapper>
      );
    }

    if (typy(account).isTruthy && walletView === WALLET_VIEWS.account) {
      return (
        <AccountDetails openOptions={() => setWalletView(WALLET_VIEWS.options)} toggleWalletModal={toggleWalletModal} />
      );
    }

    return (
      <InnerWrapper>
        {walletView !== WALLET_VIEWS.account ? (
          <TitleLabel
            onClick={() => {
              setPendingError(false);
              setWalletView(WALLET_VIEWS.account);
            }}
          >
            <HoverLabel>{translation("words.back")}</HoverLabel>
          </TitleLabel>
        ) : (
          <TitleLabel>
            <HoverLabel>{translation("structs.signIn")}</HoverLabel>
          </TitleLabel>
        )}
        <TopRightCloseIcon onClick={toggleWalletModal} />
        <ContentWrapper>
          {walletView !== WALLET_VIEWS.pending ? (
            <>
              <OptionGrid>{renderOptions()}</OptionGrid>
              <Blurb>
                <span>{translation("modals.wallet.newToEthereum") + ""}</span>
                &nbsp;
                <Link href="https://ethereum.org/use/#3-what-is-a-wallet-and-which-one-should-i-use">
                  {translation("modals.wallet.learnMore")}
                </Link>
              </Blurb>
            </>
          ) : (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              size={220}
              tryActivation={tryActivation}
              uri={uri}
            />
          )}
        </ContentWrapper>
      </InnerWrapper>
    );
  }, [
    account,
    error,
    pendingError,
    pendingWallet,
    renderOptions,
    setPendingError,
    toggleWalletModal,
    translation,
    tryActivation,
    uri,
    walletView,
  ]);

  return (
    <StyledModal
      dialogLabelId={DIALOG_LABEL_ID}
      isOpen={isWalletModalOpen}
      onDismiss={toggleWalletModal}
      maxHeight={90}
      minHeight={null}
    >
      <OuterWrapper>{render()}</OuterWrapper>
    </StyledModal>
  );
}
