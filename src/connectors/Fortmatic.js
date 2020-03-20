import typy from "typy";

import { CHAIN_IDS_TO_NAMES, MAINNET_ID, RINKEBY_ID } from "@sablier/dev-constants";
import { FortmaticConnector as FortmaticConnectorCore } from "@web3-react/fortmatic-connector";

export const OVERLAY_READY = "OVERLAY_READY";

export class FortmaticConnector extends FortmaticConnectorCore {
  async activate() {
    if (typy(this.fortmatic).isFalsy) {
      const { default: Fortmatic } = await import("fortmatic");
      this.fortmatic = new Fortmatic(
        this.apiKey,
        this.chainId === MAINNET_ID || this.chainId === RINKEBY_ID ? undefined : CHAIN_IDS_TO_NAMES[this.chainId],
      );
    }

    const provider = this.fortmatic.getProvider();

    const pollForOverlayReady = new Promise(resolve => {
      const interval = setInterval(() => {
        if (typy(provider, "overlayReady").isTruthy) {
          clearInterval(interval);
          this.emit(OVERLAY_READY);
          resolve();
        }
      }, 200);
    });

    const [account] = await Promise.all([provider.enable().then(accounts => accounts[0]), pollForOverlayReady]);

    return { account, chainId: this.chainId, provider: this.fortmatic.getProvider() };
  }
}
