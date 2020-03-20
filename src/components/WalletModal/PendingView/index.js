import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import typy from "typy";

import { SUPPORTED_WALLETS, injected, walletconnect } from "@sablier/connectors";
import { colors } from "@sablier/theme";
import { darken } from "polished";
import { useTranslation } from "react-i18next";

import Option from "../Option";
import Spinner from "../../Spinner";
import WalletConnectData from "../WalletConnectData";

const Wrapper = styled.div`
  ${props => props.theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;

  & > * {
    width: 100%;
  }
`;

const LoadingMessageWrapper = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  border: 1px solid ${props => (props.error ? props.theme.pastelRed : props.theme.platinumGray)};
  border-radius: 0.75rem;
  color: ${props => (props.error ? props.theme.pastelRed : "inherit")};
  justify-content: flex-start;
  margin-bottom: 1.25rem;

  & > * {
    padding: 1rem 0.5rem;
  }
`;

const ErrorGroupWrapper = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  justify-content: flex-start;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
`;

const ErrorButton = styled.div`
  background-color: ${props => props.theme.platinumGray};
  border-radius: 0.5rem;
  color: ${props => props.theme.darkGunmetalBlack};
  font-size: 0.8125rem;
  font-weight: 600;
  margin-left: 1rem;
  padding: 0.5rem;
  user-select: none;

  &:hover {
    background-color: ${props => darken(0.1, props.theme.platinumGray)};
    cursor: pointer;
  }
`;

const SpinnerWrapper = styled.div`
  margin-left: 0.5rem;
`;

const LoadingMessageInnerWrapper = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
`;

function PendingView({ connector, error, setPendingError, size, tryActivation, uri }) {
  const { t: translation } = useTranslation();

  /** Memoized values **/

  const isMetamask = useMemo(() => {
    return typy(window, "ethereum").isTruthy && typy(window.ethereum.isMetaMask).isTruthy;
  }, []);

  /** Callbacks **/

  const onClickErrorButton = useCallback(() => {
    setPendingError(false);
    tryActivation(connector);
  }, [connector, setPendingError, tryActivation]);

  const renderLoadingMessage = useCallback(() => {
    if (typy(error).isTruthy) {
      return (
        <ErrorGroupWrapper>
          <div>{translation("words.error") + " " + translation("words.connecting").toLowerCase()}</div>
          <ErrorButton onClick={onClickErrorButton}>{translation("structs.tryAgain")}</ErrorButton>
        </ErrorGroupWrapper>
      );
    } else {
      if (connector === walletconnect) {
        return translation("modals.wallet.scanQrCode") + "...";
      } else {
        return translation("words.initializing") + "...";
      }
    }
  }, [connector, error, onClickErrorButton, translation]);

  return (
    <Wrapper>
      {typy(error).isFalsy && connector === walletconnect && <WalletConnectData size={size} uri={uri} />}
      <LoadingMessageWrapper error={error}>
        {typy(error).isFalsy && (
          <SpinnerWrapper>
            <Spinner color={colors.bleuDeFranceBlue} size={1.25} />
          </SpinnerWrapper>
        )}
        <LoadingMessageInnerWrapper>{renderLoadingMessage()}</LoadingMessageInnerWrapper>
      </LoadingMessageWrapper>
      {Object.keys(SUPPORTED_WALLETS).map(key => {
        const option = SUPPORTED_WALLETS[key];
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== "words.metamask") {
              return null;
            }
            if (!isMetamask && option.name === "words.metamask") {
              return null;
            }
          }
          return (
            <Option
              key={key}
              color={option.color}
              isActive={false}
              isClickable={false}
              icon={option.icon}
              subtitle={translation(option.description)}
              title={translation(option.name)}
            />
          );
        }
        return null;
      })}
    </Wrapper>
  );
}

PendingView.propTypes = {
  connector: PropTypes.shape({}).isRequired,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  setPendingError: PropTypes.func.isRequired,
  size: PropTypes.number,
  tryActivation: PropTypes.func.isRequired,
  uri: PropTypes.string,
};

PendingView.defaultProps = {
  error: false,
  size: 220,
  uri: "",
};

export default PendingView;
