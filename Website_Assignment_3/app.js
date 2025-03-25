import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import Database from 'better-sqlite3';
import fs from 'fs'


// run: 
// npm install
// npm run dev

// Database
var dbFile = "app.db"
var exists = fs.existsSync(dbFile)
var db = new Database(dbFile)

// Create tables if the database did not exist previusly
if (!exists) {
    db.exec("PRAGMA foreign_keys = ON;") // Necessary to enable foreign keys.

    // Create users table.
    const users = db.prepare(
        "CREATE TABLE users (" +
        "id INTEGER PRIMARY KEY," +
        "username STRING NOT NULL UNIQUE," +
        "password STRING NOT NULL" +
        ")"
    );
    users.run()

    // Create courses table.
    const courses = db.prepare(
        "CREATE TABLE courses (" +
        "id INTEGER PRIMARY KEY," +
        "teacher STRING NOT NULL," +
        "description STRING" +
        ")"
    )
    courses.run()

    // Create friend table. With a foreign key in the users table.
    const friends = db.prepare(
        "CREATE TABLE friends (" +
        "id INTEGER PRIMARY KEY," +
        "from_user INTEGER NOT NULL," +
        "to_user INTEGER NOT NULL," +
        "status STRING NOT NULL," +
        "FOREIGN KEY (from_user) REFERENCES users(id)," +
        "FOREIGN KEY (to_user) REFERENCES users(id)" +
        ")"
    )
    friends.run()
};

db.close()

// Express application
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT;

const app = express();
app.set('view engine', 'ejs');

// Parses form data
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));


app.post('/register', (req, res) => {
    console.log(req.body);
    try {
        addUser(req.body.username, req.body.password);
    } catch {
    }
    res.redirect('/register.html');
});

app.post('/login', (req, res) => {
    let un = req.body.username;
    try {
        let user = selectUser(un);
        let passWord = user.password;
        let userName = req.body.username;
        res.render('welcome.ejs', { username: userName, password: passWord });
    } catch {
        res.redirect('/login.html');
        console.log('Incorrect username or password')
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

function addUser(username, password) {
    const db = new Database('app.db');
    const insertData = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    insertData.run(username, password);
    db.close();
    console.log(`User ${username} added to the database.`)
}

function selectUser(username) {
    const db = new Database('app.db');
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    console.log(user);
    db.close();
    return user;
}

// logAllUsers();
function logAllUsers() {
    const db = new Database('app.db');
    const query = `SELECT * FROM users`;
    const users = db.prepare(query).all();
    console.log(users);
    db.close();
}

function addCourse() {
    //TODO
}

function selectCourse() {
    //TODO
}

function logAllCourses() {
    //TODO
}






