import type { EIP1193Provider } from "viem";

interface KeplrKey {
  name: string;
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  bech32Address: string;
}

interface Keplr {
  enable(chainId: string): Promise<void>;
  getKey(chainId: string): Promise<KeplrKey>;
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
    keplr?: Keplr;
  }
}
