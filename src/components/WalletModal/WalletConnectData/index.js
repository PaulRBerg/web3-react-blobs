import React from "react";
import PropTypes from "prop-types";
import QRCode from "qrcode.react";
import styled from "styled-components";
import typy from "typy";

import { colors } from "@sablier/theme";

const QRCodeWrapper = styled.div`
  ${props => props.theme.flexColumnNoWrap};
  align-items: center;
  border-radius: 0.75rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

function WalletConnectData({ backgroundColor, foregroundColor, size, uri }) {
  return (
    <QRCodeWrapper>
      {typy(uri).isTruthy && <QRCode size={size} value={uri} bgColor={backgroundColor} fgColor={foregroundColor} />}
    </QRCodeWrapper>
  );
}

WalletConnectData.propTypes = {
  backgroundColor: PropTypes.string,
  foregroundColor: PropTypes.string,
  size: PropTypes.number,
  uri: PropTypes.string,
};

WalletConnectData.defaultProps = {
  backgroundColor: colors.white,
  foregroundColor: colors.black,
  size: 224,
  uri: "",
};

export default WalletConnectData;
