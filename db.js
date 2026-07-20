const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DONATIONS_DB_PATH || path.join(__dirname, 'donations.db');
const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT NOT NULL,
        amount INTEGER NOT NULL,
        title TEXT NOT NULL,
        group_name TEXT NOT NULL,
        discord_user_id TEXT,
        discord_user_tag TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
`);

db.exec(`CREATE INDEX IF NOT EXISTS idx_donations_nickname ON donations(nickname)`);

const insertStmt = db.prepare(`
    INSERT INTO donations (nickname, amount, title, group_name, discord_user_id, discord_user_tag)
    VALUES (@nickname, @amount, @title, @group_name, @discord_user_id, @discord_user_tag)
`);

function logDonation({ nickname, amount, title, group, discordUserId, discordUserTag }) {
    return insertStmt.run({
        nickname,
        amount,
        title,
        group_name: group,
        discord_user_id: discordUserId ?? null,
        discord_user_tag: discordUserTag ?? null,
    });
}

function getDonationsByNickname(nickname, limit = 10) {
    return db.prepare(`
        SELECT * FROM donations
        WHERE nickname = ?
        ORDER BY id DESC
        LIMIT ?
    `).all(nickname, limit);
}

function getRecentDonations(limit = 10) {
    return db.prepare(`
        SELECT * FROM donations
        ORDER BY id DESC
        LIMIT ?
    `).all(limit);
}

function getDonationSummary(nickname) {
    return db.prepare(`
        SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
        FROM donations
        WHERE nickname = ?
    `).get(nickname);
}

module.exports = {
    logDonation,
    getDonationsByNickname,
    getRecentDonations,
    getDonationSummary,
};
