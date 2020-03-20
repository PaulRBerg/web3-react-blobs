import React, { useEffect } from "react";
import styled from "styled-components";
import typy from "typy";

import { NETWORK_CONTEXT_NAME } from "@sablier/dev-constants";
import { UnknownErrorLabel } from "@sablier/theme";
import { network } from "@sablier/connectors";
import { useEagerConnect, useInactiveListener } from "@sablier/react-hooks";
import { useTranslation } from "react-i18next";
import { useWeb3React } from "@web3-react/core";

import Spinner from "../../Spinner";

const MessageWrapper = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  height: 25rem;
  justify-content: center;
  padding: 1rem 0.5rem;
`;

export default function ReactManager({ children }) {
  const { active } = useWeb3React();
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NETWORK_CONTEXT_NAME);
  const { t: translation } = useTranslation();

  /* Try to eagerly connect to an injected provider, if it exists and has granted access already */
  const triedEager = useEagerConnect();

  /**
   * After eagerly trying injected, if the network connect ever isn't active or in an error state, activate it
   * TODO: think about not doing this at all
   */
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network);
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active]);

  /* "Pause" the network connector if we're ever connected to an account and it's active */
  useEffect(() => {
    if (active && networkActive) {
      network.pause();
    }
  }, [active, networkActive]);

  /* "Resume" the network connector if we're ever not connected to an account and it's active */
  useEffect(() => {
    if (!active && networkActive) {
      network.resume();
    }
  }, [active, networkActive]);

  /* When there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists */
  useInactiveListener(!triedEager);

  /* On page load, do nothing until we've tried to connect to the injected connector */
  if (!triedEager) {
    return null;
  }

  /* If the account context isn't active, and there's an error on the network context, it's an irrecoverable error */
  if (!active && networkError) {
      error: typy(networkError, "toString").isFunction ? networkError.toString() : networkError,
    });
    return (
      <MessageWrapper>
        <UnknownErrorLabel>{translation("structs.unknownError")}</UnknownErrorLabel>
      </MessageWrapper>
    );
  }

  /* If neither context is active, spin */
  if (!active && !networkActive) {
    return (
      <MessageWrapper>
        <Spinner delay={600} />
      </MessageWrapper>
    );
  }

  return children;
}
