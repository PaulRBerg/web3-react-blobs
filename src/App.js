import React, { Suspense } from "react";
import styled from "styled-components";

import { ApolloReactManager, Header, Web3 } from "@sablier/components";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { CreateStreamContextProvider } from "@sablier/contexts";

import CreateStreamPage from "./CreateStreamPage";

import { CancelStreamContextProvider } from "../contexts/CancelStreamContext";
import { ModalsContextProvider as LocalModalsContextProvider } from "../contexts/ModalsContext";
import { useStreamActionManager } from "../contexts/StreamActionManager";

const AppWrapper = styled.div`
  align-items: stretch;
  background-color: ${props => props.theme.backgroundColor};
  display: flex;
  flex-flow: column;
  min-height: 100vh;
`;

const BodyWrapper = styled.div`
  align-items: stretch;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
`;

function LocalContextProviders({ children }) {
  return (
    <CreateStreamContextProvider>
      <CancelStreamContextProvider>
        <LocalModalsContextProvider>{children}</LocalModalsContextProvider>
      </CancelStreamContextProvider>
    </CreateStreamContextProvider>
  );
}

function HeaderAndRoutes() {
  const { isAnyStreamActionComponentOpen } = useStreamActionManager();

  return (
    <>
      <Header isAnyStreamActionComponentOpen={isAnyStreamActionComponentOpen} />
      <Switch>
      <Route exact path="/">
          <DashboardPage />
      </Route>
      <Route exact path="/stream/create">
          <CreateStreamPage />
      </Route>
      <Redirect to="/" />
      </Switch>
    </>
  );
}

function App() {
  return (
    <AppWrapper>
    <BodyWrapper>
        <BrowserRouter>
        <LocalContextProviders>
            <Web3.ReactManager>
            <ApolloReactManager>
                <HeaderAndRoutes />
            </ApolloReactManager>
            </Web3.ReactManager>
        </LocalContextProviders>
        </BrowserRouter>
    </BodyWrapper>
    </AppWrapper>
  );
}

export default App;
