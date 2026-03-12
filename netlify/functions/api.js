import { getDonation, getPage, listDonations, saveDonation, savePage } from "./lib/store.js";
import {
  buildPaymentUri,
  json,
  makeId,
  normalizeUsername,
  parseBody,
  validateWalletAddress
} from "./lib/utils.js";

function getRouteParts(event) {
  const pathname = new URL(event.rawUrl || `http://localhost${event.path}`).pathname;
  const parts = pathname.split("/").filter(Boolean);
  const apiIndex = parts.indexOf("api");
  return apiIndex >= 0 ? parts.slice(apiIndex + 1) : parts.slice(-1);
}

function sanitizePageInput(payload = {}) {
  const username = normalizeUsername(payload.username);
  return {
    username,
    displayName: (payload.displayName || username).trim(),
    avatarUrl: (payload.avatarUrl || "").trim(),
    bio: (payload.bio || "").trim(),
    btcAddress: (payload.btcAddress || "").trim(),
    goalSats: Number(payload.goalSats || 0),
    quickAmounts: Array.isArray(payload.quickAmounts)
      ? payload.quickAmounts.map(Number).filter((value) => value > 0).slice(0, 6)
      : [100, 500, 1000],
    theme: payload.theme || "aurora",
    messageMinSats: Number(payload.messageMinSats || 100),
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function sanitizeDonationInput(payload = {}) {
  return {
    amountSats: Number(payload.amountSats || 0),
    donorName: (payload.donorName || "").trim().slice(0, 40),
    message: (payload.message || "").trim().slice(0, 280)
  };
}

function badgeForIndex(index) {
  if (index === 0) return "Top Supporter";
  if (index < 3) return "Core Backer";
  return "Early Supporter";
}

function startOfDaysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function computeLeaderboard(donations) {
  const periods = {
    all: new Date(0),
    month: startOfDaysAgo(30),
    week: startOfDaysAgo(7)
  };

  return Object.entries(periods).flatMap(([period, startDate]) => {
    const buckets = new Map();

    donations
      .filter(
        (donation) =>
          donation.status === "confirmed" && new Date(donation.createdAt) >= startDate
      )
      .forEach((donation) => {
        const name = donation.donorName || "Anonymous";
        const current = buckets.get(name) || { name, totalSats: 0, count: 0, period };
        current.totalSats += donation.amountSats;
        current.count += 1;
        buckets.set(name, current);
      });

    return [...buckets.values()]
      .sort((left, right) => right.totalSats - left.totalSats)
      .map((entry, index) => ({
        ...entry,
        badge: badgeForIndex(index)
      }));
  });
}

function computeStats(donations) {
  const confirmed = donations.filter((donation) => donation.status === "confirmed");
  const pending = donations.filter((donation) => donation.status !== "confirmed");
  const supporters = new Set(confirmed.map((donation) => donation.donorName || "Anonymous"));
  const byDay = new Map();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - offset);
    const label = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    byDay.set(label, 0);
  }

  confirmed.forEach((donation) => {
    const label = new Date(donation.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short"
    });
    if (byDay.has(label)) {
      byDay.set(label, byDay.get(label) + donation.amountSats);
    }
  });

  return {
    totalConfirmedSats: confirmed.reduce((sum, donation) => sum + donation.amountSats, 0),
    pendingSats: pending.reduce((sum, donation) => sum + donation.amountSats, 0),
    donationCount: donations.length,
    uniqueSupporters: supporters.size,
    dailyTotals: [...byDay.entries()].map(([date, total]) => ({ date, total }))
  };
}

async function checkMempoolDonation(page, donation) {
  const response = await fetch(
    `https://mempool.space/api/address/${encodeURIComponent(page.btcAddress)}/txs`
  );

  if (!response.ok) {
    throw new Error("Failed to check mempool.space");
  }

  const transactions = await response.json();
  const createdAt = new Date(donation.createdAt).getTime();

  const match = transactions.find((transaction) => {
    const receivedSats = (transaction.vout || [])
      .filter((output) => output.scriptpubkey_address === page.btcAddress)
      .reduce((sum, output) => sum + Number(output.value || 0), 0);

    const seenAt = transaction.status?.block_time ? transaction.status.block_time * 1000 : 0;
    return receivedSats >= donation.amountSats && (!seenAt || seenAt >= createdAt);
  });

  if (!match) return donation;

  return {
    ...donation,
    status: match.status?.confirmed ? "confirmed" : "seen",
    txid: match.txid,
    updatedAt: new Date().toISOString()
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  try {
    const route = getRouteParts(event);
    const [resource, usernameParam, third, fourth] = route;

    if (resource === "pages" && event.httpMethod === "POST") {
      const payload = sanitizePageInput(await parseBody(event));
      if (!payload.username) return json(400, { error: "Username is required" });
      if (!validateWalletAddress(payload.btcAddress)) {
        return json(400, { error: "Valid wallet address is required" });
      }

      const existing = await getPage(payload.username);
      const page = existing
        ? { ...existing, ...payload, createdAt: existing.createdAt, updatedAt: new Date().toISOString() }
        : payload;
      await savePage(page);
      return json(200, { page });
    }

    if (resource === "pages" && usernameParam && event.httpMethod === "GET") {
      const page = await getPage(normalizeUsername(usernameParam));
      if (!page) return json(404, { error: "Page not found" });
      return json(200, { page });
    }

    if (resource === "pages" && usernameParam && event.httpMethod === "PUT") {
      const username = normalizeUsername(usernameParam);
      const existing = await getPage(username);
      if (!existing) return json(404, { error: "Page not found" });

      const payload = await parseBody(event);
      if (payload.hideDonationMessageId) {
        const donation = await getDonation(username, payload.hideDonationMessageId);
        if (!donation) return json(404, { error: "Donation not found" });
        const updatedDonation = { ...donation, hiddenMessage: true, updatedAt: new Date().toISOString() };
        await saveDonation(username, updatedDonation);
        return json(200, { donation: updatedDonation });
      }

      const merged = {
        ...existing,
        ...sanitizePageInput({ ...existing, ...payload, username }),
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString()
      };
      await savePage(merged);
      return json(200, { page: merged });
    }

    if (resource === "donate" && usernameParam && event.httpMethod === "POST" && !third) {
      const username = normalizeUsername(usernameParam);
      const page = await getPage(username);
      if (!page) return json(404, { error: "Page not found" });

      const payload = sanitizeDonationInput(await parseBody(event));
      if (!payload.amountSats || payload.amountSats < 1) {
        return json(400, { error: "Donation amount must be greater than 0" });
      }
      if (payload.message && payload.amountSats < page.messageMinSats) {
        return json(400, {
          error: `Minimum amount for leaving a message is ${page.messageMinSats} sats`
        });
      }

      const donation = {
        id: makeId("don"),
        ...payload,
        status: "pending",
        txid: "",
        paymentUri: buildPaymentUri(page.btcAddress, payload.amountSats),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveDonation(username, donation);
      return json(200, { donation });
    }

    if (
      resource === "donate" &&
      usernameParam &&
      third &&
      fourth === "check" &&
      event.httpMethod === "POST"
    ) {
      const username = normalizeUsername(usernameParam);
      const page = await getPage(username);
      if (!page) return json(404, { error: "Page not found" });
      const donation = await getDonation(username, third);
      if (!donation) return json(404, { error: "Donation not found" });
      const updated = await checkMempoolDonation(page, donation);
      await saveDonation(username, updated);
      return json(200, { donation: updated });
    }

    if (resource === "donations" && usernameParam && event.httpMethod === "GET") {
      const donations = await listDonations(normalizeUsername(usernameParam));
      return json(200, { donations });
    }

    if (resource === "leaderboard" && usernameParam && event.httpMethod === "GET") {
      const donations = await listDonations(normalizeUsername(usernameParam));
      return json(200, { leaderboard: computeLeaderboard(donations) });
    }

    if (resource === "stats" && usernameParam && event.httpMethod === "GET") {
      const donations = await listDonations(normalizeUsername(usernameParam));
      return json(200, { stats: computeStats(donations) });
    }

    return json(404, { error: "Route not found" });
  } catch (error) {
    return json(500, { error: error.message || "Unexpected server error" });
  }
}
