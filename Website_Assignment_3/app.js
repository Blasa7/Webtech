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

    // Create courses table.
    const courses = db.prepare(
        "CREATE TABLE courses (" +
        "id INTEGER PRIMARY KEY," +
        "title STRING NOT NULL," +
        "description STRING," +
        "teacher STRING" +
        ")"
    )
    courses.run()

    // Create table for user courses.
    const user_courses = db.prepare(
        "CREATE TABLE student_courses(" +
        "user_id INTEGER," +
        "course_id INTEGER," +
        "FOREIGN KEY (user_id) REFERENCES users(id)," +
        "FOREIGN KEY (course_id) REFERENCES courses(id)" +
        ")"
    )
    user_courses.run()

    // Create users table.
    const users = db.prepare( // Maybe split the passwords into their own table.
        "CREATE TABLE users (" +
        "id INTEGER PRIMARY KEY," +
        "username STRING NOT NULL UNIQUE," +
        "password STRING NOT NULL," +
        "age INTEGER," +
        "email STRING," +
        "photo BLOB," +
        "hobbies STRING," +
        "program INTEGER," +
        "FOREIGN KEY (program) REFERENCES programs(id)" +
        ")"
    );
    users.run()

    // Create programs table.
    const programs = db.prepare(
        "CREATE TABLE programs (" +
        "id INTEGER PRIMARY KEY," +
        "title STRING NOT NULL," +
        "description STRING" +
        ")"
    )
    programs.run()

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

// Session
app.set("trust proxy", 1)
app.use(session({
    secret: "1234", //TODO: Change
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

// Parses form data
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));

// Http requests
app.get('/', (req, res) => {
    if (req.session.user) { // Session exists skip login
        res.render('profile.ejs', { user: req.session.user });
    } else { // Session does not exists go to login 
        res.redirect('/login.html');
    }
})

app.post('/register', (req, res) => {
    console.log(req.body);
    try {
        addUser(req.body.username, req.body.password);
    } catch {
    }
    res.redirect('/register.html');
});

app.post('/login', (req, res) => {
    try {
        let user = login(req.body.username, req.body.password);
        req.session.user = user; // Update session with current user login
        res.render('profile.ejs', { user: req.session.user });
    } catch {
        res.redirect('/login.html');
        console.log('Incorrect username or password')
    }
});

app.post('/update-profile', (req, res) => {
    try {
        let user = updateUser(req.session.user.id, req.body.username, req.body.password, req.body.age, req.body.email, req.body.photo, req.body.hobbies, req.body.program);
        req.session.user = user;
        console.log(user)
        res.render('profile.ejs', { user: req.session.user })
    } catch {
        console.log("Failed to update user profile!")
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

// Check username and password combination
function login(username, password) {
    const db = new Database('app.db');
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
    console.log(user);
    db.close();
    return user;
}

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

function updateUser(old_user_id, username, password, age, email, photo, hobbies, program) {
    program = program || null // Foreign key accepts null but not undefined

    const db = new Database('app.db');
    db.prepare(`
    UPDATE users SET 
    username = ?, password = ?, age = ?, email = ?,
    photo = ?, hobbies = ?, program = ?
    WHERE id = ?
    `).run(username, password, age, email, photo, hobbies, program, old_user_id);
    db.close();
    return selectUser(username);
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






