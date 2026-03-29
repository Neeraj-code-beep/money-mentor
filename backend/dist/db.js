import pg from "pg";
const { Pool } = pg;
let pool = null;
export function getPool() {
    const url = process.env.DATABASE_URL;
    if (!url)
        return null;
    if (!pool) {
        pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    }
    return pool;
}
export async function initDb() {
    const p = getPool();
    if (!p) {
        console.warn("[db] DATABASE_URL not set — using in-memory store for demo.");
        return;
    }
    await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL DEFAULT 'demo@moneymentor.app',
      name TEXT DEFAULT 'Demo User',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS user_financial_profile (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      profile JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
    const r = await p.query(`SELECT id FROM users WHERE email = 'demo@moneymentor.app' LIMIT 1`);
    if (r.rows.length === 0) {
        await p.query(`INSERT INTO users (email, name) VALUES ('demo@moneymentor.app', 'Demo User')`);
    }
}
export async function getDemoUserId() {
    const p = getPool();
    if (!p)
        return null;
    const r = await p.query(`SELECT id FROM users WHERE email = 'demo@moneymentor.app' LIMIT 1`);
    return r.rows[0]?.id ?? null;
}
export async function loadProfile(userId) {
    const p = getPool();
    if (!p)
        return {};
    const r = await p.query(`SELECT profile FROM user_financial_profile WHERE user_id = $1`, [userId]);
    return r.rows[0]?.profile ?? {};
}
export async function saveProfile(userId, profile) {
    const p = getPool();
    if (!p)
        return;
    await p.query(`INSERT INTO user_financial_profile (user_id, profile, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (user_id) DO UPDATE SET profile = EXCLUDED.profile, updated_at = NOW()`, [userId, JSON.stringify(profile)]);
}
