import { SupportedWallets, useWalletConnect } from "@btc-vision/walletconnect";
import { shortAddress } from "../lib/format";

export default function WalletConnectPanel({ compact = false }) {
  const { allWallets, connectToWallet, connecting, disconnect, openConnectModal, walletAddress, walletType } =
    useWalletConnect();
  const opWalletInstalled = allWallets.some(
    (wallet) => wallet.name === SupportedWallets.OP_WALLET && wallet.isInstalled
  );

  return (
    <div
      className={
        compact
          ? "flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2"
          : "rounded-3xl border border-white/10 bg-white/5 p-5"
      }
    >
      <div className={compact ? "hidden md:block" : ""}>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">OP_NET Wallet</p>
        <p className="mt-1 text-sm text-slate-300">
          {walletAddress
            ? `Connected: ${shortAddress(walletAddress)}`
            : "Connect OP_WALLET to autofill the recipient BTC address."}
        </p>
      </div>
      {walletAddress ? (
        <div className="flex items-center gap-2">
          {!compact ? (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
              {walletType}
            </span>
          ) : null}
          <button
            type="button"
            onClick={disconnect}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={connecting}
          onClick={() =>
            opWalletInstalled ? connectToWallet(SupportedWallets.OP_WALLET) : openConnectModal()
          }
          className="rounded-full bg-amber-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-60"
        >
          {connecting ? "Connecting..." : opWalletInstalled ? "Connect OP_WALLET" : "Find wallet"}
        </button>
      )}
    </div>
  );
}
