export function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(payload)
  };
}

export function normalizeUsername(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 30);
}

export function getWalletType(address = "") {
  const value = address.trim();

  if (/^(EQ|UQ|kQ|0Q)[A-Za-z0-9_-]{46,}$/.test(value) || /^-?\d:[a-fA-F0-9]{64}$/.test(value)) {
    return "ton";
  }

  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,}$/i.test(value)) {
    return "bitcoin";
  }

  return "unknown";
}

export function validateWalletAddress(address = "") {
  return getWalletType(address) !== "unknown";
}

export function buildPaymentUri(address, sats) {
  const walletType = getWalletType(address);

  if (walletType === "ton") {
    return `ton://transfer/${address}?amount=${Math.max(0, Number(sats) || 0)}`;
  }

  const btc = Number(sats) / 100000000;
  return `bitcoin:${address}?amount=${btc.toFixed(8)}`;
}

export function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function parseBody(event) {
  if (!event.body) return {};
  return JSON.parse(event.body);
}
