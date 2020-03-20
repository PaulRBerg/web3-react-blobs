import React from "react";
import PropTypes from "prop-types";
import typy from "typy";

import { shortenAddress, shortenENS } from "@sablier/utils";
import { useENSName } from "@sablier/react-hooks";

/**
 * Display the ENS name, if there is one, or revert to the Ethereum address otherwise. Caveat: we override the React
 * components defined in the columns.
 */
function AccountLabel({ account, shortenAddress: shouldShortenAddress, shortenENS: shouldShortenENS, ...otherProps }) {
  const ENSName = useENSName(account);

  if (typy(ENSName).isTruthy) {
    return <div {...otherProps}>{shouldShortenENS ? shortenENS({ ens: ENSName }) : ENSName}</div>;
  } else {
    return (
      <div {...otherProps}>{ENSName || shouldShortenAddress ? shortenAddress({ address: account }) : account}</div>
    );
  }
}

AccountLabel.propTypes = {
  account: PropTypes.string.isRequired,
  shortenAddress: PropTypes.bool,
  shortenENS: PropTypes.bool,
};

AccountLabel.defaultProps = {
  shortenAddress: true,
  shortenENS: true,
};

export default AccountLabel;
