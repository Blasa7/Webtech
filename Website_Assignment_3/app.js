import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import Database from 'better-sqlite3';
import fs, { stat } from 'fs'
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
        status STRING,
        CONSTRAINT edge UNIQUE (from_user, to_user)
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
    resave: true,
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
// Middleware to intercept all requests to check whether the client is logged in.
app.all('*', (req, res, next) => {
    try {
        // Dont redirect away from login or register.
        if (req.path == '/login' || req.path == '/register') {
            return next('route');
        }

        // If the session exists allow the request otherwise redirect to login page.
        if (req.session.userID) {
            next('route');
        } else { // Session does not exists go to login
            console.log('Client not logged in redirecting to login page...')
            res.redirect('/login.html');
        }
    } catch (err) {
        console.log('Failed to redirect user!');
        console.log(err);
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

            req.session.save();

            // Load profile page
            res.redirect('/profile');

            console.log('User has logged in!');
        } else {
            res.redirect('/login.html');
            console.log('Incorrect username/password combination!');
        }
    } catch {
        res.redirect('/login.html');
        console.log('Failed to log in!');
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

app.post('/send-friend-request/:targetID', (req, res) => {
    try {
        // Dont allow users to befriend themselves.
        if (req.params.targetID == req.session.userID) {
            return;
        }

        const status = selectFriendStatus(req.session.userID, req.params.targetID);

        // If the status is not pending or accepted create a new friend request.
        if (status == 'NONE') {
            const incoming = selectFriendStatus(req.params.targetID, req.session.userID);

            // If the target has already sent a request to the current user then befriend them otherwise send a request.
            if (incoming != 'NONE') {
                updateFriendRequest(req.session.userID, req.params.targetID, 'ACCEPTED');
                updateFriendRequest(req.params.targetID, req.session.userID, 'ACCEPTED');
            } else {
                updateFriendRequest(req.session.userID, req.params.targetID, 'PENDING');
            }
        }

        // Redirect to retrieve status.
        return res.redirect(`/friend-status/${req.params.targetID}`);
    } catch (err) {
        console.log('Failed to send friend request!');
        console.log(err);
    }
});

app.post('/cancel-friend-request/:targetID', (req, res) => {
    try {
        // Dont allow users to unfriend themselves.
        if (req.params.targetID == req.session.userID) {
            return;
        }

        const status = selectFriendStatus(req.session.userID, req.params.targetID);

        // If there is a pending request cancel it.
        if (status == 'PENDING') {
            updateFriendRequest(req.session.userID, req.params.targetID, 'NONE');
        }

        // Redirect to retrieve status.
        return res.redirect(`/friend-status/${req.params.targetID}`);
    } catch {
        console.log('Failed to cancel friend request!');
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
});

app.get('/student-program-id', (req, res) => {
    try {
        const programID = selectProgramID(req.session.userID);

        res.send(programID);
    } catch (err) {
        console.log("Failed to retrieve student program!");
        console.log(err);
    }
});

app.get('/student-photo', (req, res) => {
    try {
        const photo = selectPhoto(req.session.userID);

        res.send(photo);
    } catch {
        console.log("Failed to retrieve student photo!");
    }
});

app.get('/student-photo/:studentID', (req, res) => {
    try {
        const photo = selectPhoto(req.params.studentID);

        res.send(photo);
    } catch (err) {
        console.log("Failed to retrieve student photo!");
        console.log(err);
    }
});

app.get('/course-student-list/:courseID', (req, res) => {
    try {
        const students = selectCourseStudents(req.params.courseID);

        res.send(students);
    } catch (err) {
        console.log('Failed to retrieve course students!');
        console.log(err);
    }
});

// Returns the friend status. Can be ; 'INVALID', 'NONE', 'INCOMING', 'PENDING', 'ACCEPTED'
app.get('/friend-status/:targetID', (req, res) => {
    try {
        if (req.params.targetID == req.session.userID) {
            return res.send('INVALID');
        }

        const status = selectFriendStatus(req.session.userID, req.params.targetID);

        if (status == 'NONE') {
            const incoming = selectFriendStatus(req.params.targetID, req.session.userID);

            if (incoming == 'PENDING') {
                return res.send('INCOMING');
            }
        }
        return res.send(status);
    } catch {
        console.log('Failed to retrieve friend status!');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

function parseStudent(userID){
    // Parse everything into the right format.
    let partialStudent = selectStudent(userID);
    let partialProgram = selectProgram(userID);
    let partialCourses = selectCourses(userID);

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

    return student;
}

// Utility
function updateSessionStudent(req) {
    const student = parseStudent(req.session.userID);

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

// Loads the friend overview page with the session information from req.
app.get('/friends-overview', (req, res) => {
    return res.render('friends-overview.ejs', { userFriends: selectUserFriends(req.session.userID) });
});

// Loads the profile view of the given user id.
app.get('/profile-view/:targetID', (req, res) => {
    return res.render('profile-view.ejs', { userID: req.params.targetID, student: parseStudent(req.params.targetID) });
});



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
        students INNER JOIN programs ON students.program = programs.id
        WHERE user_id = ?
    `).get(userID);

    db.close();

    return program;
}

function selectProgramID(userID) {
    const db = new Database('app.db');

    const programID = db.prepare(`
        SELECT program FROM 
        students
        WHERE user_id = ?
    `).get(userID);

    db.close();

    return programID;
}

// Return all courses for the given user id.
function selectCourses(userID) {
    const db = new Database('app.db');

    const courses = db.prepare(`
        SELECT id, title, description, teacher FROM 
        student_courses INNER JOIN courses ON student_courses.course_id = courses.id
        WHERE user_id = ?
    `).all(userID);

    db.close();

    return courses;
}

function selectCourseStudents(courseID) {
    const db = new Database('app.db');

    const students = db.prepare(`
        SELECT students.* FROM students
        INNER JOIN student_courses ON students.user_id = student_courses.user_id
        WHERE course_id = ?
    `).all(courseID);

    db.close();

    return students;
}

function selectFriendStatus(fromUserID, toUserId) {
    const db = new Database('app.db');

    const status = db.prepare(`
        SELECT status FROM friends
        WHERE from_user = ? AND to_user = ?
    `).get(fromUserID, toUserId);

    db.close();

    if (status) {
        return status.status;
    } else {
        return 'NONE'
    }
}

function selectUserFriends(userID) {
    const db = new Database('app.db');

    const friends = db.prepare(`
        SELECT students.* FROM 
        students INNER JOIN (
            SELECT to_user FROM friends
            WHERE from_user = ? AND status = 'ACCEPTED'
        ) friend 
        ON students.user_id = friend.to_user 
    `).all(userID);

    db.close();

    return friends;
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

function updateFriendRequest(fromUserID, toUserId, status) {
    const db = new Database('app.db');

    db.prepare(`
       INSERT OR IGNORE INTO friends
       (from_user, to_user)
       VALUES (?, ?) 
    `).run(fromUserID, toUserId);
    /*db.prepare(`
        INSERT OR REPLACE INTO friends
        (from_user, to_user) 
        VALUES (?, ?)
    `).run(fromUserID, toUserId);
*/
    db.prepare(`
        UPDATE friends SET
        status = ?
        WHERE from_user = ? AND to_user = ?
    `).run(status, fromUserID, toUserId);

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








