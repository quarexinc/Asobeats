import "server-only";
import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";
import {
  Beat,
  DEFAULT_SETTINGS,
  Message,
  Order,
  PublicBeat,
  Settings,
} from "./types";

/* ------------------------------------------------------------------ */
/* Depolama: Vercel'de Upstash Redis, bilgisayarında yerel JSON dosyası */
/* ------------------------------------------------------------------ */

type Collection = "beats" | "orders" | "messages";

interface Store {
  getAll<T>(col: Collection): Promise<T[]>;
  get<T>(col: Collection, id: string): Promise<T | null>;
  set<T>(col: Collection, id: string, value: T): Promise<void>;
  del(col: Collection, id: string): Promise<void>;
  getSettings(): Promise<Partial<Settings> | null>;
  setSettings(s: Settings): Promise<void>;
}

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const hasRedis = Boolean(redisUrl && redisToken);
export const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
export const isVercel = Boolean(process.env.VERCEL);

const PREFIX = "asobeats:";

function redisStore(): Store {
  const redis = new Redis({ url: redisUrl!, token: redisToken! });
  return {
    async getAll<T>(col: Collection) {
      const all = await redis.hgetall<Record<string, T>>(PREFIX + col);
      return all ? Object.values(all) : [];
    },
    async get<T>(col: Collection, id: string) {
      return (await redis.hget<T>(PREFIX + col, id)) ?? null;
    },
    async set<T>(col: Collection, id: string, value: T) {
      await redis.hset(PREFIX + col, { [id]: value });
    },
    async del(col: Collection, id: string) {
      await redis.hdel(PREFIX + col, id);
    },
    async getSettings() {
      return (await redis.get<Partial<Settings>>(PREFIX + "settings")) ?? null;
    },
    async setSettings(s: Settings) {
      await redis.set(PREFIX + "settings", s);
    },
  };
}

/* Yerel geliştirme için basit dosya veritabanı */
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
type LocalDb = {
  beats: Record<string, unknown>;
  orders: Record<string, unknown>;
  messages: Record<string, unknown>;
  settings: Settings | null;
};

let queue: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readLocal(): Promise<LocalDb> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8"));
  } catch {
    return { beats: {}, orders: {}, messages: {}, settings: null };
  }
}
async function writeLocal(db: LocalDb) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

function localStore(): Store {
  return {
    async getAll<T>(col: Collection) {
      return Object.values((await readLocal())[col]) as T[];
    },
    async get<T>(col: Collection, id: string) {
      return ((await readLocal())[col][id] as T) ?? null;
    },
    set<T>(col: Collection, id: string, value: T) {
      return locked(async () => {
        const db = await readLocal();
        db[col][id] = value;
        await writeLocal(db);
      });
    },
    del(col: Collection, id: string) {
      return locked(async () => {
        const db = await readLocal();
        delete db[col][id];
        await writeLocal(db);
      });
    },
    async getSettings() {
      return (await readLocal()).settings;
    },
    setSettings(s: Settings) {
      return locked(async () => {
        const db = await readLocal();
        db.settings = s;
        await writeLocal(db);
      });
    },
  };
}

const store: Store = hasRedis ? redisStore() : localStore();

/* ------------------------------ Beatler ------------------------------ */

export async function listBeats(): Promise<Beat[]> {
  const beats = await store.getAll<Beat>("beats");
  return beats.sort((a, b) => b.createdAt - a.createdAt);
}

export function toPublic(beat: Beat): PublicBeat {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fileUrl, fileName, ...rest } = beat;
  return rest;
}

export async function listPublicBeats(): Promise<PublicBeat[]> {
  const beats = await listBeats();
  return beats
    .filter((b) => b.published)
    .sort((a, b) => Number(a.sold) - Number(b.sold) || Number(b.featured) - Number(a.featured) || b.createdAt - a.createdAt)
    .map(toPublic);
}

export const getBeat = (id: string) => store.get<Beat>("beats", id);
export const saveBeat = (beat: Beat) => store.set("beats", beat.id, beat);
export const deleteBeat = (id: string) => store.del("beats", id);

/* ----------------------------- Siparişler ---------------------------- */

export async function listOrders(): Promise<Order[]> {
  const orders = await store.getAll<Order>("orders");
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}
export const getOrder = (code: string) => store.get<Order>("orders", code);
export const saveOrder = (order: Order) => store.set("orders", order.code, order);
export const deleteOrder = (code: string) => store.del("orders", code);

/** Siparişi ödendi yap: satış sayısını artırır, tek satışsa beati kapatır */
export async function markOrderPaid(order: Order): Promise<Order> {
  if (order.status === "paid") return order;
  const updated: Order = { ...order, status: "paid", paidAt: Date.now() };
  await saveOrder(updated);
  const beat = await getBeat(order.beatId);
  if (beat) {
    await saveBeat({
      ...beat,
      salesCount: (beat.salesCount || 0) + 1,
      sold: beat.exclusive ? true : beat.sold,
      updatedAt: Date.now(),
    });
  }
  return updated;
}

/* ------------------------------ Mesajlar ----------------------------- */

export async function listMessages(): Promise<Message[]> {
  const msgs = await store.getAll<Message>("messages");
  return msgs.sort((a, b) => b.createdAt - a.createdAt);
}
export const getMessage = (id: string) => store.get<Message>("messages", id);
export const saveMessage = (m: Message) => store.set("messages", m.id, m);
export const deleteMessage = (id: string) => store.del("messages", id);

/* ------------------------------- Ayarlar ----------------------------- */

export async function getSettings(): Promise<Settings> {
  try {
    const s = await store.getSettings();
    return { ...DEFAULT_SETTINGS, ...(s || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
export const saveSettings = (s: Settings) => store.setSettings(s);

/* ------------------------------ Yardımcı ----------------------------- */

export function newId(len = 12) {
  const chars = "abcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
