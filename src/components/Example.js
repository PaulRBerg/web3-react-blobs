import { useWeb3React } from "../hooks";

/* This is how you'd use web3-react in your own components */

export default function Example() {
  /* These values get updated automatically, so if the user changes the network on Metamask, chainId will have the proper value */
  const { account, chainId, library } = useWeb3React();

  console.log({ account, chainId, library });

  return <>Hello World</>;
}
