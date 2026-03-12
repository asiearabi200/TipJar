export function formatSats(value) {
  return `${Number(value || 0).toLocaleString("en-US")} sats`;
}

export function satsToBtc(value) {
  return Number(value || 0) / 100000000;
}

export function shortAddress(address = "") {
  if (address.length < 14) return address;
  return `${address.slice(0, 7)}...${address.slice(-6)}`;
}

export function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
