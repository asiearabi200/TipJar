import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import { shortAddress } from "../lib/format";

export default function WalletConnectPanel({ compact = false }) {
  const wallet = useTonWallet();

  return (
    <div
      className={
        compact
          ? "flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2"
          : "rounded-3xl border border-white/10 bg-white/5 p-5"
      }
    >
      <div className={compact ? "hidden md:block" : ""}>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">OP Wallet</p>
        <p className="mt-1 text-sm text-slate-300">
          {wallet?.account?.address
            ? `Connected: ${shortAddress(wallet.account.address)}`
            : "Connect a wallet to autofill the recipient address."}
        </p>
      </div>
      <TonConnectButton className={compact ? "ton-connect-compact" : undefined} />
    </div>
  );
}
