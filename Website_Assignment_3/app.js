import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import Database from 'better-sqlite3';
import fs from 'fs'
import multer from 'multer';
import { initProfilePage } from './generatedPages/generateHTML.js';


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

    // Create user_posts table.
    const user_posts = db.prepare(
        "CREATE TABLE user_posts (" +
        "id INTEGER PRIMARY KEY," +
        "user_id INTEGER NOT NULL," +
        "title STRING NOT NULL," +
        "text STRING NOT NULL," +
        "posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
        "FOREIGN KEY (user_id) REFERENCES users(id)" +
        ")"
    );
    user_posts.run()

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

    // Insert some dummy values
    const insertCourse1 = db.prepare(
        "INSERT INTO courses (title, description, teacher) VALUES (?, ?, ?)"
    );
    insertCourse1.run("Webtech", "Vak over webtech.", "Sergey Sosnovsky");

    const insertCourse2 = db.prepare(
        "INSERT INTO courses (title, description, teacher) VALUES (?, ?, ?)"
    );
    insertCourse2.run("Computationele Intelligentie", "Vak over computationele intelligentie.", "Dirk Thierens");

    const insertProgram1 = db.prepare(
        "INSERT INTO programs (title, description) VALUES (?, ?)"
    );
    insertProgram1.run("Informatica", "Programma over informatica.");

    const insertProgram2 = db.prepare(
        "INSERT INTO programs (title, description) VALUES (?, ?)"
    );
    insertProgram2.run("Informatiekunde", "Programma over informatiekunde.");
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
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true
    }
}))

// Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

// Parses form data
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));

// Http requests
app.get('/', (req, res) => {
    if (req.session.user) { // Session exists skip login
        //res.render('profile.ejs', { user: req.session.user, availableCourses: getAvailableCourses() });
        res = loadProfile(req, res);
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
    console.log(getAvailableCourses());
    try {
        // Check login credentials
        let user = login(req.body.username, req.body.password);
        user.courses = getUserCourses(user.id);

        // Update session
        req.session.user = user; // Update session with current user login
        req.session.save()

        // Load profile page
        res = loadProfile(req, res);
    } catch {
        res.redirect('/login.html');
        console.log('Incorrect username or password')
    }
});

app.post('/update-profile', upload.single("photo"), (req, res) => {
    try {
        let body = JSON.parse(JSON.stringify(req.body))
        let photo = req.file ? req.file.buffer : null;
        // Update database
        let user = updateUser(req.session.user.id, body.username, body.password, body.age, body.email, body.hobbies, body.program);
        let courses = updateStudentCourses(user.id, body.courses);

        if (photo) {
            updateUserPhoto(user.id, photo);
        }

        // Update session
        req.session.user = user;
        req.session.user.courses = courses;

        // Load new page
        res = loadProfile(req, res);
    } catch (err) {
        console.log("Failed to update user profile!");
        console.log(err);
    }
});

app.get('/profile', (req, res) => { // page generated with dom manipulation
    let username = req.session.user.username;
    if (username !== undefined) {
        const html = initProfilePage(username);
        res.send(html);
    }
    else {
        res.redirect('/login');
    }
});

app.get('/student-courses', (req, res) => {
    try {
        const courses = getUserCourses(req.session.user.id);

        res.send(courses);
    } catch {
        console.log("Failed to retrieve student courses!");
    }
})

app.get('/student-program', (req, res) => {
    try {
        const program = getUserProgram(req.session.user.id);
        console.log(program)

        res.send(program);
    } catch {
        console.log("Failed to retrieve student program!");
    }
})

app.get('/student-photo', (req, res) => {
    try {
        const photo = getStudentPhoto(req.session.user.id);
        console.log(photo)
        res.send(photo);
    } catch {
        console.log("Failed to retrieve student photo!");
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

// Functions to load pages

// Loads the user profile with the session information from req.
function loadProfile(req, res) {
    return res.render('profile.ejs', { user: req.session.user, availableCourses: getAvailableCourses(), availablePrograms: getAvailablePrograms() })
}





// Check username and password combination
function login(username, password) {
    const db = new Database('app.db');
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
    console.log(`${username} logged in.`);
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

function updateUser(old_user_id, username, password, age, email, hobbies, program) {
    program = program || null // Foreign key accepts null but not undefined

    const db = new Database('app.db');
    db.prepare(`
    UPDATE users SET 
    username = ?, password = ?, age = ?, email = ?,
    hobbies = ?, program = ?
    WHERE id = ?
    `).run(username, password, age, email, hobbies, program, old_user_id);
    db.close();
    return selectUser(username);
}

function updateStudentCourses(userID, courses) {
    const db = new Database('app.db');
    db.prepare(`
        DELETE FROM student_courses
        WHERE user_id = ?
        `).run(userID);

    const insertStudentCourse = db.prepare(`
        INSERT INTO student_courses
        (user_id, course_id) VALUES (?, ?)
        `);

    if (courses) {
        Object.values(courses).forEach(value => {
            console.log(value)
            insertStudentCourse.run(userID, value)
        })
    }

    db.close();

    return getUserCourses(userID);
}

function updateUserPhoto(userID, photo) {
    const db = new Database('app.db');
    db.prepare(`
    UPDATE users SET 
    photo = ?
    WHERE id = ?
    `).run(photo, userID);
    db.close();
}

function getUserCourses(userID) {
    const db = new Database('app.db');
    const courses = db.prepare('SELECT course_id FROM student_courses WHERE user_id = ?').all(userID);
    db.close();
    return courses;
}

function getUserProgram(userID) {
    const db = new Database('app.db');
    const courses = db.prepare('SELECT program FROM users WHERE id = ?').get(userID);
    db.close();
    return courses;
}

function getAvailableCourses() {
    const db = new Database('app.db');
    const courses = db.prepare('SELECT * FROM courses').all();
    db.close();
    return courses;
}

function getAvailablePrograms() {
    const db = new Database('app.db');
    const courses = db.prepare('SELECT * FROM programs').all();
    db.close();
    return courses;
}

function getStudentPhoto(userID) {
    const db = new Database('app.db');
    const photo = db.prepare('SELECT photo FROM users WHERE id = ?').get(userID).photo;
    db.close();
    return photo;
}






