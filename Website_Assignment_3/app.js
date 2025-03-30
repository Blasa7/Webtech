import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import Database from 'better-sqlite3';
import fs from 'fs'
import multer from 'multer';
import { initProfilePage } from './generatedPages/generateHTML.js';
import * as lib from './public/js/lib.js'


// run: 
// npm install
// npm run dev

// Database
var dbFile = "app.db"
var exists = fs.existsSync(dbFile)
var db = new Database(dbFile)

// Create tables if the database did not exist previusly
if (!exists) {
    db.exec(`PRAGMA foreign_keys = ON;`) // Necessary to enable foreign keys.

    // Create courses table.
    db.prepare(
        `CREATE TABLE courses (
        id INTEGER PRIMARY KEY,
        title STRING NOT NULL,
        description STRING,
        teacher STRING
    )`).run();

    // Create table for user courses.
    db.prepare(
        `CREATE TABLE student_courses ( 
        user_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id)
    )`).run();

    // Create users table.
    db.prepare(
        `CREATE TABLE students (
        user_id INTEGER REFERENCES users(id),
        name STRING NOT NULL UNIQUE,
        age INTEGER,
        email STRING,
        photo BLOB,
        hobbies STRING,
        program INTEGER REFERENCES programs(id)
    )`).run();


    db.prepare(
        `CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        password STRING NOT NULL
    )`).run();

    // Create messages table containing all messages.
    db.prepare(
        `CREATE TABLE messages (
        from_user_id INTEGER REFERENCES users(id),
        to_user_id INTEGER REFERENCES users(id),
        title STRING NOT NULL,
        text STRING NOT NULL,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`).run();

    // Create programs table.
    db.prepare(
        `CREATE TABLE programs (
        id INTEGER PRIMARY KEY,
        title STRING NOT NULL,
        description STRING
    )`).run();

    // Create friend table. With a foreign keys in the users table.
    db.prepare(
        `CREATE TABLE friends (
        from_user INTEGER REFERENCES users(id),
        to_user INTEGER REFERENCES users(id),
        status STRING NOT NULL
    )`).run();

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
    try {
        register(req.body.username, req.body.password);
    } catch (err) {
        console.log('Failed to register user!');
        console.log(err);
    }
    res.redirect('/register.html');
});

app.post('/login', (req, res) => {
    try {
        // Check login credentials
        let userID = login(req.body.username, req.body.password);

        if (userID) {
            req.session.userID = userID;

            req = updateSessionStudent(req)

            // Load profile page
            res.redirect('/profile');
            //res = loadProfile(req, res);

            console.log('User has logged in!');
        } else {
            res.redirect('/login.html');
            console.log('Incorrect username/password combination!');
        }
    } catch (err) {
        res.redirect('/login.html');
        console.log('Failed to log in!');
        console.log(err)
    }
});

app.post('/update-profile', upload.single("photo"), (req, res) => {
    try {
        let body = JSON.parse(JSON.stringify(req.body))
        let photo = req.file ? req.file.buffer : null;

        // Update database
        updateStudent(req.session.userID, body.username, body.age, body.email, body.hobbies, body.program);
        updateStudentCourses(req.session.userID, body.courses);

        if (photo) {
            updateStudentPhoto(req.session.userID, photo);
        }

        // Update session
        req = updateSessionStudent(req);

        // Load new page
        res.redirect('profile');
        //res = loadProfile(req, res);
    } catch (err) {
        console.log("Failed to update user profile!");
        console.log(err);
    }
});

/*app.get('/profile', (req, res) => { // page generated with dom manipulation
    let username = req.session.user.username;
    if (username !== undefined) {
        const html = initProfilePage(username);
        res.send(html);
    }
    else {
        res.redirect('/login');
    }
});*/

app.get('/student-courses', (req, res) => {
    try {
        const courses = selectCourses(req.session.userID);

        res.send(courses);
    } catch {
        console.log("Failed to retrieve student courses!");
    }
})

app.get('/student-program', (req, res) => {
    try {
        const program = selectProgram(req.session.userID);

        res.send(program);
    } catch {
        console.log("Failed to retrieve student program!");
    }
})

app.get('/student-photo', (req, res) => {
    try {
        const photo = selectPhoto(req.session.userID);

        res.send(photo);
    } catch {
        console.log("Failed to retrieve student photo!");
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

// Utility
function updateSessionStudent(req) {
    // Parse everything into the right format.
    let partialStudent = selectStudent(req.session.userID);
    let partialProgram = selectProgram(req.session.userID);
    let partialCourses = selectCourses(req.session.userID);

    let program;

    if (partialProgram) {
        program = new lib.Program(partialProgram.title, partialProgram.description);
    } else {
        program = new lib.Program(undefined, undefined)
    }

    let courses = []
    for (let i = 0; i < partialCourses.length; i++) {
        let course = new lib.Course(
            partialCourses[i].title,
            partialCourses[i].description,
            partialCourses[i].teacher
        )

        courses.push(course);
    }

    let student = new lib.Student(
        partialStudent.name,
        partialStudent.age,
        partialStudent.email,
        partialStudent.hobbies,
        partialStudent.photo,
        program,
        courses
    )

    // Update session information.
    req.session.student = student;

    return req;
}

// Functions to load pages

// Loads the user profile with the session information from req.
app.get('/profile', (req, res) => {
    return res.render('profile.ejs', { student: req.session.student, availableCourses: getAvailableCourses(), availablePrograms: getAvailablePrograms() });
});

// Loads the course overview page with the session information from req.
app.get('/course-overview', (req, res) => {
    return res.render('course-overview.ejs', { userCourses: selectCourses(req.session.userID) });
})

function register(username, password) {
    const db = new Database('app.db');

    const exists = db.prepare(`
        SELECT * FROM students
        WHERE name = ?
    `).get(username);

    if (!exists) {
        // Make new user id with password.
        const info = db.prepare(`
            INSERT INTO users (password)
            VALUES (?)
        `).run(password);

        // Make student row
        db.prepare(`
            INSERT INTO students (name, user_id) 
            VALUES (?, ?)
        `).run(username, info.lastInsertRowid);
    }

    db.close();
}

// Check username and password combination and returns the user id if succesfull.
function login(username, password) {
    const db = new Database('app.db');

    const user = db.prepare(
        `SELECT user_id FROM 
        students LEFT JOIN users ON students.user_id = users.id 
        WHERE name = ? AND password = ?
    `).get(username, password).user_id;

    db.close();

    return user;
}



// Returns all fields from the students table for the given user id.
function selectStudent(userID) {
    const db = new Database('app.db');

    const user = db.prepare(`
        SELECT * FROM students 
        WHERE user_id = ?
    `).get(userID);

    db.close();

    return user;
}

// Returns the student photo field for the given user id.
function selectPhoto(userID) {
    const db = new Database('app.db');

    const photo = db.prepare(`
        SELECT photo FROM students 
        WHERE user_id = ?
    `).get(userID).photo;

    db.close();

    return photo;
}

// Return the program for the given user id.
function selectProgram(userID) {
    const db = new Database('app.db');

    const program = db.prepare(`
        SELECT title, description FROM 
        students LEFT JOIN programs ON students.program = programs.id
        WHERE user_id = ?
    `).get(userID);

    db.close();

    return program;
}

// Return all courses for the given user id.
function selectCourses(userID) {
    const db = new Database('app.db');

    const courses = db.prepare(`
        SELECT course_id, title, description, teacher FROM 
        student_courses LEFT JOIN courses ON student_courses.course_id = courses.id
        WHERE user_id = ?
    `).all(userID);

    db.close();

    return courses;
}

function updateStudent(userID, name, age, email, hobbies, program) {
    program = program || null // Foreign key accepts null but not undefined

    const db = new Database('app.db');

    db.prepare(`
        UPDATE students SET 
        name = ?, age = ?, email = ?,
        hobbies = ?, program = ?
        WHERE user_id = ?
    `).run(name, age, email, hobbies, program, userID);

    db.close();
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
        });
    }

    db.close();
}

function updateStudentPhoto(userID, photo) {
    const db = new Database('app.db');

    db.prepare(`
        UPDATE students SET 
        photo = ?
        WHERE user_id = ?
    `).run(photo, userID);

    db.close();
}

function getAvailableCourses() {
    const db = new Database('app.db');

    const courses = db.prepare(`
        SELECT * FROM courses
    `).all();

    db.close();

    return courses;
}

function getAvailablePrograms() {
    const db = new Database('app.db');

    const courses = db.prepare(`
        SELECT * FROM programs
    `).all();

    db.close();

    return courses;
}








