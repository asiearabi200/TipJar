const headers = {
  "Content-Type": "application/json"
};

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

export async function createPage(data) {
  return parseResponse(
    await fetch("/api/pages", {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })
  );
}

export async function updatePage(username, data) {
  return parseResponse(
    await fetch(`/api/pages/${username}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data)
    })
  );
}

export async function getPage(username) {
  return parseResponse(await fetch(`/api/pages/${username}`));
}

export async function createDonation(username, data) {
  return parseResponse(
    await fetch(`/api/donate/${username}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })
  );
}

export async function getDonations(username) {
  return parseResponse(await fetch(`/api/donations/${username}`));
}

export async function checkDonation(username, donationId) {
  return parseResponse(
    await fetch(`/api/donate/${username}/${donationId}/check`, {
      method: "POST",
      headers
    })
  );
}

export async function getLeaderboard(username) {
  return parseResponse(await fetch(`/api/leaderboard/${username}`));
}

export async function getStats(username) {
  return parseResponse(await fetch(`/api/stats/${username}`));
}
