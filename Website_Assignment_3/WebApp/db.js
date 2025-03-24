import Database from 'better-sqlite3';
const db = new Database('app.db');

// Create table
const query = `
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username STRING NOT NULL UNIQUE, 
        password STRING NOT NULL
    );
`;
db.exec(query);

db.close();