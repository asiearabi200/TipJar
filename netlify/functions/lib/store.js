import { getStore } from "@netlify/blobs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const pagesIndexKey = "pages:index";
const localDbPath = path.resolve(process.cwd(), ".data", "tipjar.json");

function pageKey(username) {
  return `page:${username}`;
}

function donationKey(username, donationId) {
  return `donation:${username}:${donationId}`;
}

function donationsIndexKey(username) {
  return `donations:${username}:index`;
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function canUseNetlifyBlobs() {
  return Boolean(
    process.env.NETLIFY ||
      process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.SITE_ID && process.env.NETLIFY_AUTH_TOKEN)
  );
}

async function readLocalDb() {
  try {
    const raw = await readFile(localDbPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeLocalDb(data) {
  await mkdir(path.dirname(localDbPath), { recursive: true });
  await writeFile(localDbPath, JSON.stringify(data, null, 2), "utf8");
}

function createLocalStore() {
  return {
    async get(key, options = {}) {
      const db = await readLocalDb();
      const value = db[key];
      if (options.type === "json") {
        return value ?? null;
      }
      return value == null ? null : JSON.stringify(value);
    },
    async setJSON(key, value) {
      const db = await readLocalDb();
      db[key] = value;
      await writeLocalDb(db);
    }
  };
}

const store = canUseNetlifyBlobs() ? getStore("tipjar") : createLocalStore();

export async function getPage(username) {
  const raw = await store.get(pageKey(username), { type: "json" });
  return raw || null;
}

export async function savePage(page) {
  await store.setJSON(pageKey(page.username), page);
  const usernames = await listPageUsernames();
  if (!usernames.includes(page.username)) {
    await store.setJSON(pagesIndexKey, [...usernames, page.username]);
  }
  return page;
}

export async function listPageUsernames() {
  const raw = await store.get(pagesIndexKey);
  return safeJsonParse(raw, []);
}

export async function listDonations(username) {
  const raw = await store.get(donationsIndexKey(username));
  const ids = safeJsonParse(raw, []);
  const donations = await Promise.all(
    ids.map((id) => store.get(donationKey(username, id), { type: "json" }))
  );

  return donations
    .filter(Boolean)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export async function getDonation(username, donationId) {
  return store.get(donationKey(username, donationId), { type: "json" });
}

export async function saveDonation(username, donation) {
  await store.setJSON(donationKey(username, donation.id), donation);
  const indexRaw = await store.get(donationsIndexKey(username));
  const index = safeJsonParse(indexRaw, []);
  if (!index.includes(donation.id)) {
    await store.setJSON(donationsIndexKey(username), [...index, donation.id]);
  }
  return donation;
}
