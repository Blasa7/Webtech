import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import Database from 'better-sqlite3';
import fs from 'fs'
import multer from 'multer';
import * as lib from './public/js/lib.js'
import morgan from 'morgan'

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

    // Create user table containing user id and passwords.
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
        text STRING,
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

    // Insert some dummy values,
    const insertCourse = db.prepare(
        "INSERT INTO courses (title, description, teacher) VALUES (?, ?, ?)"
    );
    insertCourse.run('Webtech', 
        `Het uitgangspunt van dit vak is het http protocol en alles wat daar bovenop gebouwd kan worden. Daarbij wordt ervaring opgedaan met relevante talen en technologieen, zoals (X)HTML, CSS, JavaScript, PHP en frameworks. Daarnaast wordt ingegaan op de historische context van het WWW en worden de concepten achter en allerlei technische aspecten van het WWW toegelicht. Ook dient de deelnemer zich het bijbehorende jargon eigen te maken.`, 
        'Sergey Sosnovsky'
    );
    insertCourse.run('Computationele Intelligentie',
        `Vak over computationele intelligentie.`,
        'Dirk Thierens'
    );
    insertCourse.run('Data-analyse en retrieval', 
        `In het eerste jaar heb je kennis gemaakt met database systemen. Daarmee kunnen grote hoeveelheden data efficient opgeslagen en bevraagd worden. In dit vak bouwen we hierop voort, waarbij twee belangrijke kwesties aan de orde komen.
        De eerste vraag is hoe je omgaat met grote hoeveelheden data die niet de nauwkeurige recordstructuur hebben zoals in databases. De hoeveelheid ongestructureerde data (lees vooral: tekst) in de wereld is een veelvoud van de hoeveelheid gestructureerde data. Het zoeken in teksten vereist een heel andere aanpak, vooral omdat het aantal resultaten zeer groot kan zijn, waardoor ranking op basis van relevantie essentieel wordt. Deze tak van sport duiden we aan me Information Retrieval (IR). Hoewel deze discipline al vrij lang bestaat, is de relevantie in de laatste jaren toegenomen door de behoefte aan zoekmachines op het web.
        We zullen kennis maken met basisbegrippen uit de IR: precision, recall, boolean search, indexering en posting lists, term weighting, vector-space-model en relevance feedback. Verder zullen we in detail kijken naar het PageRank-algoritme van Google.
        Bij dit gedeelte hoort een practicumopgave waarbij we technieken uit de IR zullen toepassen bij het verwerken van queries op relationele databases, met als probleem dat het aantal resultaten of te groot, of te klein is.
        De tweede vraag is hoe we interessante patronen en modellen uit deze data kunnen extraheren. Dit is het vakgebied van de data mining/machine learning. Ook hier zullen we het accent leggen op de analyse van ongestructureerde data (lees wederom: tekst), zoals het gebruik van data mining voor documentclassificatie en - clustering, alsmede voor het ranken van documenten op basis van hun relevantie voor een bepaalde query. Het begrip "document" moet je hier ruim opvatten: het kan bijvoorbeeld ook over webpagina's, e-mail berichten (spam of geen spam?), postings naar een nieuwsgroep of zelfs tweets gaan.
        Technieken die hierbij aan de orde komen zijn o.a.: naive Bayes classificatie, nearest neighbour, support vector machines, hierarchisch clusteren en partitioneringsmethoden zoals k-means clustering.
        Bij dit gedeelte hoort een practicumopgave waarbij we de in het college behandelde data-analyse technieken zullen toepassen op problemen zoals hierboven aangeduid. Hierbij zullen we gebruik maken van het data-analyse systeem R.`, 
        'Hans Philippi');
    insertCourse.run('Optimalisering en complexiteit',
        `Dit is een vak uit de 'algoritmiek' hoek, waarbij het er niet omgaat om een algoritme zo snel mogelijk te maken (al kun je je daar wel op uitleven bij de practicumopdracht); de nadruk ligt hier op het bedenken van een goed algoritme. Om een concreet voorbeeld te nemen: stel dat je een rij getallen moet sorteren op grootte. Een simpel algoritme (uit de steentijd) zou zijn het omwisselen van twee naast elkaar staande getallen die niet in de goede volgorde staan. Dit duurt lang, maar met een beetje handigheid in software engineering kun je het enorm versnellen, zodat je in het tijdperk van de Flintstones komt: het leven is comfortabel, maar het blijft de steentijd. De volgende stap voorwaarts is het vinden van een goed algoritme, zoals Quicksort; je kunt stellen dat je met een beetje normale implementatie dan al in de 20ste eeuw bent beland. Tot slot kun je natuurlijk nog het algoritme versnellen door een goede implementatie te kiezen, zodat je uiteindelijk in de 21ste eeuw terecht bent gekomen. Uiteraard kun je erover twisten wat nu belangrijker is: implementatie of algoritme, maar de top wordt geleverd door van beide het beste te kiezen.`,
        'Han Hoogeveen'
    );
    insertCourse.run('Talen en Compilers',
        `Many programs take a sequence of symbols as input. These sequences almost always have some structure. Examples of such sequences of symbols are: programs in any programming language; a packet of information sent over the Internet; or information written into a file by a program (with the intention of that information being later re-read).
        The structure of those sequences is described with the help of grammars (grammatica's). From these descriptions one can automatically generate programs that recognize the corresponding structure, known as parsers (ontleders). This process of recognition is an important component of many programs, for example, a translator from one data type (say, a source code file) into another (the internal structures used by the compiler). The description of the process of translation makes use of a grammar formalism. By using some specific classes of grammars, we can not only express the structure of the sequence, but also ensure that the structure is easy to recognize; for example, that it can be recognized in linear time.`,
        'David van Balen'
    );
    insertCourse.run('Beeldverwerking',
        `Image Processing provides basic knowledge and skills for the analysis and processing of digital images. We discuss fundamental and core techniques such as filters, edges and colors. We also treat advanced topics including corner detection, automatic thresholding, geometric operations and scale-invariant feature transforms. The course will be in English. The assignments are mandatory and require C# skills.`,
        'Itir Önal Ertuğrul'
    )
    insertCourse.run('Security',
        `Deze cursus bestaat ruwweg uit drie delen.
        Het eerste deel behandelt symmetrische cryptografie, zoals AES, en DES, Rainbow en hash Tables en A5 stroomversleuteling.
        Het tweede deel behandelt asymmetrische cryptografie. Deze cryptografie is gebaseerd op getalberekeningen aan de hand van getaltheoretische concepten die worden uitgelegd aan de hand van encryptiealgoritmen zoals RSA, Elgamal, en digitale handtekeningen.
        Het derde deel bespreekt recente ontwikkelingen in de cyper security zoals de impact van quantum computing, Denial of service attacks en de werking van cryptomunten.`,
        'Gerard Tel'
    );
    insertCourse.run('Driedimensionaal modelleren',
        `3D modelleren gaat over het bouwen en representeren van objecten in de ruimte. Deze modellen kunnen gebaseerd zijn op ingewonnen data (laser scanning), op handgefabriceerde modellen in een modelleerprogramma, of op procdures zoals L-systemen. The voornaamste motivatie voor de constructie van deze 3D modellen is CAD/CAM, de filmindustrie, de gamesindustrie, de geneeskunde, de architectuur, animatie, robotica en fysische simulaties. Een model kan gevisualiseerd of op een andere manier gebruikt worden. 3D modelleren gebruikt allerlei technieken om om te gaan met krommen, grote point clouds en gestructureerde meshes. Aspecten als continuiteit, efficientie en correctheid zijn ook belangrijk.`,
        'Maarten Löffler'
    );
    insertCourse.run('Software Testing en Verificatie',
        `Testing is noodzakelijk om te garanderen dat onze software betrouwbaar is. Echter, software wordt steeds complexer. Testing wordt ook erg duur, omdat er te veel mogelijke executies zijn die getest moeten worden. We zouden dus keuzes moeten maken. In dit vak gaan we een aantal kern concepten, theorieën en technieken leren, zoals partitie-gebaseerd of control-flow-gebaseerd, om testing als een doelgericht en systematisch proces te beschrijven en uit te voeren. Ook zal er aandacht gegeven worden aan het testen van computer games. In sommige toepassingsgebieden is het echter belangrijk om het risico van fouten zo min mogelijk te houden (denk aan de elektronica van je autos). We gaan dus ook een programmeerlogica leren, waarmee we een programma correct kunnen bewijzen, zonder dat wij het programma hoeven te testen. De methode is volledig: een correct aangetoond programma voldoet echt aan zijn specificatie.`,
        'Wishnu Prasetya'
    );
    insertCourse.run('Algoritmiek',
        `In many practical applications, the speed of software is very important. Often this means that, besides fast computers and smart compilers, we need efficient algorithms. To design and develop such efficient algorithms, you will study several techniques and topics in Algoritmiek.
        The course emphasizes both fundamental aspects (running time analysis and correctness proofs) and practical aspects (implementation challenges) of algorithmics. The lectures provide a solid foundation to this. You will study time analysis and proofs in the tutorial sessions, while you can work on implementation challenges in the practicals.`,
        'Erik Jan van Leeuwen'
    );

    const insertProgram = db.prepare(
        "INSERT INTO programs (title, description) VALUES (?, ?)"
    );
    insertProgram.run('Informatica', 'Programma over informatica.');
    insertProgram.run('Informatiekunde', 'Programma over informatiekunde.');
    insertProgram.run('Gametechnologie', 'Programma over games.');

    const hobbies = ['Programming', 'Gaming', 'Chess', 'Football', 'Reading', 'Juggling', 'Anime', 'Drinking'];

    const insertFakeStudent = (name, password,) => {
        register(name, password);
        const id = login(name, password);
        const hobby1 = Math.round(Math.random() * (hobbies.length - 1));
        let hobby2 = Math.round(Math.random() * (hobbies.length - 1));
        if (hobby2 == hobby1){
            hobby2 = (hobby2 + 1) % (hobbies.length - 1);
        }

        updateStudent(
            id, 
            name, 
            18 + Math.floor(Math.random() * 20),
            `${name}@student.uu.nl`,
            `${hobbies[hobby1]}, ${hobbies[hobby2]}`,
            Math.round(Math.random() * 2)
        );

        const course1 = 1 + Math.round(Math.random() * 9);
        let course2 = 1 + Math.round(Math.random() * 9);
        if (course2 == course1){
            course2 = 1 + ((course2 + 1) % 9)
        }

        updateStudentCourses(id, [course1, course2]);
    }
    // Randomly generated names.
    const names = [
        'Rodrick',
        'Gail',
        'Jasper',
        'Johnny',
        'Lance',
        'Clara',
        'Franklyn',
        'Stacey',
        'German',
        'Darell',
        'Andre',
        'Jonah',
        'Virgie',
        'Raquel',
        'Millicent',
        'Frances',
        'April',
        'Dona',
        'Araceli',
        'Homer',
        'Augustine',
        'Sheldon',
        'Franklin',
        'Gail',
        'Johnnie',
        'Leann',
        'Latoya',
        'Manuel',
        'Randolph',
        'Loyd',
        'Angie',
        'Shelley',
        'Graciela',
        'Rudy',
        'Donald',
        'Gay',
        'Rickie',
        'Leonardo',
        'Hyman',
        'Hai',
        'Antione',
        'Estela',
        'Elba',
        'Opal',
        'Emmitt',
        'Ofelia',
        'Robyn',
        'Alphonso',
        'Guadalupe',
        'Loraine']
    for (let i = 0; i < 50; i++){
        // Password and name are kept the same for example purposes.
        insertFakeStudent(names[i], names[i]);
    }

    const randomUsers = db.prepare(`
        SELECT id FROM users
        ORDER BY RANDOM() LIMIT 30
    `).all();

    const greeting = ['Hello', 'How are you doing?', 'Whats up', 'How are things?', 'How have you been?', 'Whats new?']
    const responses1 = ['Im great', 'Im not doing good', 'Its bad', 'Could be better', 'Amazing', 'Never better'];
    const responses2 = ['Cool', 'Awesome', 'Love to hear it', 'Amazing', 'Fantastic', 'Not what i wanted to hear.']
    
    for (let i = 0; i < 20; i++) {
        const friendID1 = randomUsers[Math.round(1 + i + Math.random() * (29 - i - 1))].id;
        const friendID2 = randomUsers[Math.round(1 + i + Math.random() * (29 - i - 1))].id;

        updateFriendRequest(randomUsers[i].id, friendID1, 'ACCEPTED');
        updateFriendRequest(randomUsers[i].id, friendID2, 'ACCEPTED');

        insertMessage(randomUsers[i].id, friendID1, greeting[Math.floor(Math.random() * (greeting.length - 1))]);
        insertMessage(friendID1, randomUsers[i].id, responses1[Math.floor(Math.random() * (responses1.length - 1))]);
        insertMessage(randomUsers[i].id, friendID1, responses2[Math.floor(Math.random() * (responses2.length - 1))]);
        
        insertMessage(randomUsers[i].id, friendID2, greeting[Math.floor(Math.random() * (greeting.length - 1))]);
        insertMessage(friendID2, randomUsers[i].id, responses1[Math.floor(Math.random() * (responses1.length - 1))]);
        insertMessage(randomUsers[i].id, friendID2, responses2[Math.floor(Math.random() * (responses2.length - 1))]);
    }
    
};

db.close()

// Express application
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 8049;//process.env.PORT;

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
app.use(express.json());

// Logger
app.use(morgan('combined'));

// Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

// Parses form data
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));

const root = '/group49/'

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
            res.redirect(root + 'login.html');
        }
    } catch (err) {
        console.log('Failed to redirect user!');
        console.log(err);
    }
})

// Register user request.
app.post('/register', (req, res) => {
    try {
        register(req.body.username, req.body.password);
    } catch (err) {
        console.log('Failed to register user!');
        console.log(err);
    }
    res.redirect(root + 'register.html');
});

// Login user request.
app.post('/login', (req, res) => {
    try {
        // Check login credentials
        let userID = login(req.body.username, req.body.password);

        if (userID) {
            req.session.userID = userID;

            req = updateSessionStudent(req)

            req.session.save();

            // Load profile page
            res.redirect(root + 'profile');

            console.log('User has logged in!');
        } else {
            res.redirect(root + 'login.html');
            console.log('Incorrect username/password combination!');
        }
    } catch {
        res.redirect(root + 'login.html');
        console.log('Failed to log in!');
    }
});

// Update profile request.
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
        res.redirect(root + 'profile');
    } catch (err) {
        console.log("Failed to update user profile!");
        console.log(err);
    }
});

// Send friend from the session user to the target user. If theres a incoming pending request then it is accepted.
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
        return res.redirect(root + `/friend-status/${req.params.targetID}`);
    } catch (err) {
        console.log('Failed to send friend request!');
        console.log(err);
    }
});

// Cancels a friend request if it is pending otherwise does nothing.
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
        return res.redirect(root + `/friend-status/${req.params.targetID}`);
    } catch {
        console.log('Failed to cancel friend request!');
    }
});

// Sends a message from the session user to the target user.
app.post('/send-message/:targetID', (req, res) => {
    try {
        insertMessage(req.session.userID, req.params.targetID, req.body.text);

        res.send();
    } catch (err) {
        console.log('Failed to send message!');
        console.log(err);
    }
});

app.get('/logout', (req, res) => {
    try {
        req.session.destroy();

        res.redirect(root + 'login.html');
    } catch {
        console.log('User failed to log out!');
    }
});

// Retrieve a list of courses for the session user.
app.get('/student-courses', (req, res) => {
    try {
        const courses = selectCourses(req.session.userID);

        res.send(courses);
    } catch {
        console.log("Failed to retrieve student courses!");
    }
});

// Retrieve the program id for the session user.
app.get('/student-program-id', (req, res) => {
    try {
        const programID = selectProgramID(req.session.userID);

        res.send(programID);
    } catch (err) {
        console.log("Failed to retrieve student program!");
        console.log(err);
    }
});

// Retrieve the student photo for the session user.
app.get('/student-photo', (req, res) => {
    try {
        const photo = selectPhoto(req.session.userID);

        res.send(photo);
    } catch {
        console.log("Failed to retrieve student photo!");
    }
});

// Retrieve the student photo for the given user id.
app.get('/student-photo/:studentID', (req, res) => {
    try {
        const photo = selectPhoto(req.params.studentID);

        res.send(photo);
    } catch (err) {
        console.log("Failed to retrieve student photo!");
        console.log(err);
    }
});

// Retrieve a list of students for a particular course.
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

// Parses a user id into a student class by retrieve the information from the db.
function parseStudent(userID) {
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

// Updates the session student with data from the database.
function updateSessionStudent(req) {
    const student = parseStudent(req.session.userID);

    // Update session information.
    req.session.student = student;

    return req;
}

// Functions to load pages

// Loads the user profile with the session information from req.
app.get('/profile', (req, res) => {
    return res.render('profile.ejs', {
        student: req.session.student,
        availableCourses: getAvailableCourses(),
        availablePrograms: getAvailablePrograms()
    });
});

// Loads the course overview page with the session information from req.
app.get('/course-overview', (req, res) => {
    return res.render('course-overview.ejs', {
        userCourses: selectCourses(req.session.userID)
    });
})

// Loads the friend overview page with the session information from req.
app.get('/friends-overview', (req, res) => {
    return res.render('friends-overview.ejs', {
        userFriends: selectUserFriends(req.session.userID)
    });
});

// Loads the profile view of the given user id.
app.get('/profile-view/:targetID', (req, res) => {
    return res.render('profile-view.ejs', {
        userID: req.params.targetID,
        student: parseStudent(req.params.targetID)
    });
});

// Loads the chat page between the current user and the target user.
app.get('/chat/:targetID', (req, res) => {
    return res.render('chat.ejs', {
        userID: req.session.userID,
        toUserId: req.params.targetID,
        fromName: req.session.student.name,
        toName: selectName(req.params.targetID),
        messages: selectMessages(req.session.userID, req.params.targetID)
    });
});


// Registers a new user in the database with the given password. If the user already exists nothing is done.
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

// Returns the student name of the give user id.
function selectName(userID) {
    const db = new Database('app.db');

    const name = db.prepare(`
        SELECT name FROM students 
        WHERE user_id = ?
    `).get(userID).name;

    db.close();

    return name;
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

// Return the program id for the given user id.
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

// Returns a list of students that follow the given course id.
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

// Return the current friend status from fromUserID to toUserID
function selectFriendStatus(fromUserID, toUserID) {
    const db = new Database('app.db');

    const status = db.prepare(`
        SELECT status FROM friends
        WHERE from_user = ? AND to_user = ?
    `).get(fromUserID, toUserID);

    db.close();

    if (status) {
        return status.status;
    } else { // This way no records need to be stored if no requests have been made.
        return 'NONE'
    }
}

// Returns a list of friend for the given user id.
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

// Returns all messages between two user sorted from oldest to newest.
function selectMessages(userID1, userID2) {
    const db = new Database('app.db');

    const messages = db.prepare(`
        SELECT from_user_id, to_user_id, text, posted_at 
        FROM messages
        WHERE (from_user_id = $userID1 AND to_user_id = $userID2) 
        OR (to_user_id = $userID1 AND from_user_id = $userID2)
        ORDER BY posted_at ASC
    `).all({ userID1: userID1, userID2: userID2 });

    db.close();

    return messages;
}

// Updates the given user id with the passed parameters.
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

// Updates the courses a student follows. It is separate from update student because courses are stored in a separate table.
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
            insertStudentCourse.run(userID, value)
        });
    }

    db.close();
}

// Updates the photo for the given student with the passed photo parameter.
function updateStudentPhoto(userID, photo) {
    const db = new Database('app.db');

    db.prepare(`
        UPDATE students SET 
        photo = ?
        WHERE user_id = ?
    `).run(photo, userID);

    db.close();
}

// Inserts and updates the friend request with the passed status.
function updateFriendRequest(fromUserID, toUserId, status) {
    const db = new Database('app.db');

    db.prepare(`
       INSERT OR IGNORE INTO friends
       (from_user, to_user)
       VALUES (?, ?) 
    `).run(fromUserID, toUserId);

    db.prepare(`
        UPDATE friends SET
        status = ?
        WHERE from_user = ? AND to_user = ?
    `).run(status, fromUserID, toUserId);

    db.close();
}

// Creates a new message between the users with the passed content.
function insertMessage(fromUserID, toUserID, textContent) {
    const db = new Database('app.db');

    db.prepare(`
        INSERT INTO messages (from_user_id, to_user_id, text)
        VALUES (?, ?, ?)
    `).run(fromUserID, toUserID, textContent);

    db.close();
}

// Returns a list of all available courses.
function getAvailableCourses() {
    const db = new Database('app.db');

    const courses = db.prepare(`
        SELECT * FROM courses
    `).all();

    db.close();

    return courses;
}

// Returns a list of all available programs.
function getAvailablePrograms() {
    const db = new Database('app.db');

    const courses = db.prepare(`
        SELECT * FROM programs
    `).all();

    db.close();

    return courses;
}








