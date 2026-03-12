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
