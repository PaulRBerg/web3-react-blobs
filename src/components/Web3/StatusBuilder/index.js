import React, { useCallback } from "react";
import CoinbaseWalletIcon from "@sablier/assets/svg/coinbase-wallet-icon.svg";
import FortmaticIcon from "@sablier/assets/images/fortmatic-icon.png";
import PortisIcon from "@sablier/assets/images/portis-icon.png";
import WalletConnectIcon from "@sablier/assets/svg/wallet-connect-icon.svg";
import styled, { css } from "styled-components";
import typy from "typy";

import { NETWORK_CONTEXT_NAME } from "@sablier/dev-constants";
import { Activity } from "react-feather";
import { fortmatic, injected, portis, walletconnect, walletlink } from "@sablier/connectors";
import { useTranslation } from "react-i18next";

import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";

import AccountLabel from "../AccountLabel";
import Identicon from "../../Identicon";

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

const ErrorWrapper = styled(Wrapper)``;

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

export default function useStatusBuilder() {
  const { t: translation } = useTranslation();
  const { active, account, connector, error } = useWeb3React();
  const contextNetwork = useWeb3React(NETWORK_CONTEXT_NAME);

  /* Handle the logo we want to show with the account */
  const buildIcon = useCallback(() => {
    if (typy(error).isTruthy) {
      return <NetworkIcon />;
    }
    if (connector === injected) {
      return <Identicon />;
    } else if (connector === walletconnect) {
      return <WalletConnectIcon />;
    } else if (connector === walletlink) {
      return <CoinbaseWalletIcon />;
    } else if (connector === fortmatic) {
      return <img alt="" src={FortmaticIcon} />;
    } else if (connector === portis) {
      return <img alt="" src={PortisIcon} />;
    } else {
      return null;
    }
  }, [connector, error]);

  const buildStatus = useCallback(() => {
    if (typy(account).isTruthy) {
      return {
        type: "success",
        payload: <AccountLabel account={account} shortenAddress />,
      };
    } else if (typy(error).isTruthy) {
        error: typy(error, "toString").isFunction ? error.toString() : error,
      });
      return {
        type: "error",
        payload: (
          <ErrorWrapper>
            <NetworkIcon />
            <Label capitalize>
              {error instanceof UnsupportedChainIdError
                ? translation("words.wrong") + " " + translation("words.network")
                : translation("words.error")}
            </Label>
          </ErrorWrapper>
        ),
      };
    } else {
      return {
        type: "connect",
        payload: <></>,
      };
    }
  }, [account, error, translation]);

  if (!contextNetwork.active && !active) {
    return {
      icon: null,
      status: null,
    };
  }

  return {
    icon: buildIcon(),
    status: buildStatus(),
  };
}
