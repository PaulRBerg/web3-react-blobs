import React, { useCallback } from "react";
import CoinbaseWalletIcon from "@sablier/assets/svg/coinbase-wallet-icon.svg";
import FortmaticIcon from "@sablier/assets/images/fortmatic-icon.png";
import PortisIcon from "@sablier/assets/images/portis-icon.png";
import WalletConnectIcon from "@sablier/assets/svg/wallet-connect-icon.svg";
import styled, { css } from "styled-components";
import typy from "typy";

import { NETWORK_CONTEXT_NAME } from "@sablier/dev-constants";
import { Activity, User } from "react-feather";
import { colors } from "@sablier/theme";
import { darken } from "polished";
import { fortmatic, injected, portis, walletconnect, walletlink } from "@sablier/connectors";
import { useTranslation } from "react-i18next";
import { useWalletModalManager } from "@sablier/contexts";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";

import AccountLabel from "../AccountLabel";
import Identicon from "../../Identicon";
import WalletModal from "../../WalletModal";

const Wrapper = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  border-bottom-right-radius: 1.25rem;
  border-top-right-radius: 1.25rem;
  flex-grow: 1;
  justify-content: center;
  padding: 0.5rem;
  user-select: none;

  ${props => props.theme.mediaWidth.upToMedium`
    border-radius: 1.25rem;
  `};
`;

const ErrorWrapper = styled(Wrapper)`
  background-color: ${props => props.theme.pastelRed};
  border: 1px solid ${props => props.theme.pastelRed};
  color: ${props => props.theme.white};
  font-weight: 500;

  &:active,
  &:hover {
    background-color: ${props => darken(0.1, props.theme.pastelRed)};
  }
`;

const ConnectWrapper = styled(Wrapper)`
  font-weight: 500;
`;

const UserIcon = styled(User)`
  height: 0.875rem;
  width: 0.875rem;
`;

const ConnectedWrapper = styled(Wrapper)`
  background-color: ${props => props.theme.transparent};
  color: ${props => props.theme.darkGunmetalBlack};
  font-weight: 400;
`;

const Label = styled.span`
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${props =>
    props.capitalize &&
    css`
      text-transform: capitalize;
    `}
`;

const NetworkIcon = styled(Activity)`
  height: 1rem;
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 1rem;
`;

const IconWrapper = styled.div`
  ${props => props.theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;

  & > * {
    height: ${props => (props.size ? props.size + "rem" : "2rem")};
    width: ${props => (props.size ? props.size + "rem" : "2rem")};
  }
`;

export default function Status() {
  const { t: translation } = useTranslation();
  const { active, account, connector, error } = useWeb3React();
  const contextNetwork = useWeb3React(NETWORK_CONTEXT_NAME);

  const { toggle: toggleWalletModal } = useWalletModalManager();

  /* Handle the logo we want to show with the account */
  const renderIcon = useCallback(() => {
    if (connector === injected) {
      return <Identicon />;
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={1}>
          <WalletConnectIcon />
        </IconWrapper>
      );
    } else if (connector === walletlink) {
      return (
        <IconWrapper size={1}>
          <CoinbaseWalletIcon />
        </IconWrapper>
      );
    } else if (connector === fortmatic) {
      return (
        <IconWrapper size={1}>
          <img alt="" src={FortmaticIcon} />
        </IconWrapper>
      );
    } else if (connector === portis) {
      return (
        <IconWrapper size={1}>
          <img alt="" src={PortisIcon} />
        </IconWrapper>
      );
    } else {
      return null;
    }
  }, [connector]);

  const renderStatus = useCallback(() => {
    if (typy(account).isTruthy) {
      return (
        <ConnectedWrapper onClick={toggleWalletModal}>
          {renderIcon()}
          <Label>
            <AccountLabel account={account} shortenAddress />
          </Label>
        </ConnectedWrapper>
      );
    } else if (typy(error).isTruthy) {
        error: typy(error, "toString").isFunction ? error.toString() : error,
      });
      return (
        <ErrorWrapper onClick={toggleWalletModal}>
          <NetworkIcon />
          <Label capitalize>
            {error instanceof UnsupportedChainIdError
              ? translation("words.wrong") + " " + translation("words.network")
              : translation("words.error")}
          </Label>
        </ErrorWrapper>
      );
    } else {
      return (
        <ConnectWrapper onClick={toggleWalletModal}>
          <UserIcon color={colors.darkGunmetalBlack} />
          <Label capitalize>{translation("structs.signIn")}</Label>
        </ConnectWrapper>
      );
    }
  }, [account, error, renderIcon, toggleWalletModal, translation]);

  if (!contextNetwork.active && !active) {
    return null;
  }

  return (
    <>
      {renderStatus()}
      <WalletModal />
    </>
  );
}
