const Database = require("better-sqlite3");

const db = new Database("triage.db");

db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    description TEXT,
    category TEXT,
    priority TEXT,
    assigned_team TEXT,
    summary TEXT,
    confidence REAL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    processing_time INTEGER,
    batch_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE,
    ai_category TEXT,
    ai_priority TEXT,
    corrected_category TEXT,
    corrected_priority TEXT,
    reviewer_id TEXT,
    category_wrong INTEGER,
    priority_wrong INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id)
);
`);

module.exports = db;