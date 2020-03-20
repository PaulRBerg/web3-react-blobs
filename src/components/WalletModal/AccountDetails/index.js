/* eslint-disable no-nested-ternary */
import React, { useCallback } from "react";
import FortmaticIcon from "@sablier/assets/images/fortmatic-icon.png";
import PortisIcon from "@sablier/assets/images/portis-icon.png";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import typy from "typy";

import { SUPPORTED_WALLETS, fortmatic, injected, portis, walletconnect, walletlink } from "@sablier/connectors";
import { GreenCircle, Link, TopRightCloseIcon } from "@sablier/theme";
import { getEtherscanLink } from "@sablier/utils";
import { isMobile } from "react-device-detect";
import { useENSName, useWeb3React } from "@sablier/react-hooks";
import { useTranslation } from "react-i18next";

import CopyHelper from "../../CopyHelper";
import Identicon from "../../Identicon";

/**
 * This has be here because stylelint triggers a false positive linting error otherwise. It thinks that
 * `& h5` should be defined before `& h5:last-child`.
 */
const AccountWrapper = styled.div`
  border: 1px solid ${props => props.theme.platinumGray};
  border-radius: 1.25rem;
  padding: 1rem;

  & h4 {
    font-weight: 500;
    margin: 0rem;
  }

  & h5 {
    font-weight: 400;
    margin: 0rem 0rem 1rem 0rem;
  }
`;

const OuterWrapper = styled.div`
  background-color: ${props => props.theme.snowWhite};
  position: relative;

  & h4 {
    font-weight: 500;
    margin-top: 0rem;
  }

  & h5 {
    font-size: 1rem;
    font-weight: 400;
    margin: 0rem;
    margin-bottom: 0.5rem;
  }

  & h5:last-child {
    margin-bottom: 0rem;
  }
`;

const TitleLabel = styled.h4`
  ${props => props.theme.flexRowNoWrap};
  font-size: 1.1875rem;
  font-weight: 500;
  margin: 0rem;
  padding: 1.5rem;

  ${props => props.theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`;

const AccountSectionWrapper = styled.div`
  background-color: ${props => props.theme.snowWhite};
  padding: 0rem 1.5rem;

  ${props => props.theme.mediaWidth.upToMedium`
    padding: 1rem;
    padding-top: 0rem;
  `};
`;

const GroupingRow = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  color: ${props => props.theme.darkGunmetalBlack};
  font-weight: 500;
  justify-content: space-between;

  div {
    ${props => props.theme.flexRowNoWrap};
    align-items: center;
  }

  &:first-of-type {
    margin-bottom: 20px;
  }
`;

const WalletAction = styled.div`
  color: ${props => props.theme.chaliceGray};
  font-weight: 400;
  margin-left: 16px;

  :active,
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const MainWalletAction = styled(WalletAction)`
  color: ${props => props.theme.bleuDeFranceBlue};
`;

const StyledGreenCircle = styled(GreenCircle)`
  margin-left: 0.75rem;
  margin-right: 0.125rem;
  margin-top: -0.375rem;
`;

const AccountControl = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  font-size: ${props => (props.hasENS ? (props.isENS ? "1rem" : "0.8rem") : "1rem")};
  font-weight: ${props => (props.hasENS ? (props.isENS ? "500" : "400") : "500")};
  min-width: 0rem;

  & a {
    min-width: 0rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:active,
    &:hover {
      text-decoration: underline;
    }
  }

  ${props =>
    props.hasENS &&
    props.isENS &&
    css`
      margin-bottom: 0.5rem;
    `}
`;

const ConnectButtonRow = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  margin: 1.875rem;
`;

const StyledLink = styled(Link)`
  color: ${props =>
    props.hasENS
      ? props.isENS
        ? props.theme.bleuDeFranceBlue
        : props.theme.nickelGray
      : props.theme.bleuDeFranceBlue};
`;

const WalletName = styled.div`
  padding-left: 0.5rem;
  width: initial;
`;

const IconWrapper = styled.div`
  ${props => props.theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;

  & > img,
  span {
    height: ${props => (props.size ? props.size + "rem" : "2rem")};
    width: ${props => (props.size ? props.size + "rem" : "2rem")};
  }

  ${props => props.theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`;

const OptionButton = styled.div`
  ${props => props.theme.flexColumnNoWrap};
  align-items: center;
  border: 1px solid ${props => props.theme.bleuDeFranceBlue};
  border-radius: 1.25rem;
  color: ${props => props.theme.bleuDeFranceBlue};
  font-family: ${props => props.theme.fallbackFont};
  justify-content: center;
  padding: 0.5rem 1.5rem;

  &:active,
  &:hover {
    border: 1px solid ${props => props.theme.blueJeansBlue};
    cursor: pointer;
  }

  ${props => props.theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

function AccountDetails({ toggleWalletModal, openOptions }) {
  const { t: translation } = useTranslation();

  const { account, chainId, connector } = useWeb3React();
  const ENSName = useENSName(account);

  /* TODO: find an alternative, this is unnecessarily complicated */
  const formatConnectorName = useCallback(() => {
    const isMetaMask = window.ethereum && typy(window.ethereum.isMetaMask).isTruthy;
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        key =>
          SUPPORTED_WALLETS[key].connector === connector &&
          (connector !== injected || isMetaMask === (key === "METAMASK")),
      )
      .map(k => translation(SUPPORTED_WALLETS[k].name))[0];

    return <WalletName>{name}</WalletName>;
  }, [connector, translation]);

  const renderIcon = useCallback(() => {
    if (connector === injected) {
      return (
        <IconWrapper size={1}>
          <Identicon />
          {formatConnectorName()}
        </IconWrapper>
      );
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={1}>
          <img alt="" src={require("@sablier/assets/svg/wallet-connect-icon.svg")} />
          {formatConnectorName()}
        </IconWrapper>
      );
    } else if (connector === walletlink) {
      return (
        <IconWrapper size={1}>
          <img alt="" src={require("@sablier/assets/svg/coinbase-wallet-icon.svg")} />
          {formatConnectorName()}
        </IconWrapper>
      );
    } else if (connector === fortmatic) {
      return (
        <IconWrapper size={1}>
          <img alt="" src={FortmaticIcon} />
          {formatConnectorName()}
        </IconWrapper>
      );
    } else if (connector === portis) {
      return (
        <>
          <IconWrapper size={1}>
            <img alt="" src={PortisIcon} />
            {formatConnectorName()}
            <MainWalletAction
              onClick={() => {
                connector.portis.showPortis();
              }}
            >
              {translation("words.show")}
              {translation("words.portis")}
            </MainWalletAction>
          </IconWrapper>
        </>
      );
    }
    return undefined;
  }, [connector, formatConnectorName, translation]);

  const renderFirstGroupingRow = useCallback(() => {
    return (
      <GroupingRow>
        {renderIcon()}
        <div>
          {/* TODO: enable the disconnect button for Coinbase Wallet too */}
          {connector !== injected && connector !== walletlink && (
            <WalletAction
              onClick={() => {
                connector.close();
              }}
            >
              {translation("words.disconnect")}
            </WalletAction>
          )}
          <StyledGreenCircle />
        </div>
      </GroupingRow>
    );
  }, [connector, renderIcon, translation]);

  const renderSecondGroupingRow = useCallback(() => {
    return (
      <GroupingRow>
        {typy(ENSName).isTruthy && (
          <AccountControl hasENS={typy(ENSName).isTruthy} isENS>
            <StyledLink
              hasENS={typy(ENSName).isTruthy}
              href={getEtherscanLink({ chainId, data: ENSName, type: "address" })}
              isENS
            >
              {ENSName}
              &nbsp;
              {"↗ "}
            </StyledLink>
            <CopyHelper toCopy={ENSName} />
          </AccountControl>
        )}

        <AccountControl hasENS={typy(ENSName).isTruthy} isENS={false}>
          <StyledLink
            hasENS={typy(ENSName).isTruthy}
            href={getEtherscanLink({ chainId, data: account, type: "address" })}
            isENS={false}
          >
            {account}
            &nbsp;
            {"↗ "}
          </StyledLink>
          <CopyHelper toCopy={account} />
        </AccountControl>
      </GroupingRow>
    );
  }, [ENSName, account, chainId]);

  const renderConnectButton = useCallback(() => {
    const isEthereumFalsy = typy(window, "ethereum").isFalsy;
    const isWeb3Falsy = typy(window, "web3").isFalsy;
    if (!isMobile || (isEthereumFalsy && isWeb3Falsy)) {
      return (
        <ConnectButtonRow>
          <OptionButton
            onClick={() => {
              openOptions();
            }}
          >
            {translation("modals.wallet.connectToADifferentWallet")}
          </OptionButton>
        </ConnectButtonRow>
      );
    } else {
      return null;
    }
  }, [openOptions, translation]);

  return (
    <OuterWrapper>
      <TitleLabel>{translation("words.account")}</TitleLabel>
      <TopRightCloseIcon onClick={toggleWalletModal} />
      <AccountSectionWrapper>
        <AccountWrapper>
          {renderFirstGroupingRow()}
          {renderSecondGroupingRow()}
        </AccountWrapper>
        {renderConnectButton()}
      </AccountSectionWrapper>
    </OuterWrapper>
  );
}

AccountDetails.propTypes = {
  openOptions: PropTypes.func.isRequired,
  toggleWalletModal: PropTypes.func.isRequired,
};

export default AccountDetails;
