import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';
import session from 'express-session';
import Database from 'better-sqlite3';

// run: 
// npm install
// npm run dev

const db = new Database('app.db');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT;

const app = express();
app.set('view engine','ejs');

// Parses form data
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));


app.post('/register', (req,res) => {
    console.log(req.body);
    try {
        addUser(req.body.username, req.body.password);
    } catch {
    }
    res.redirect('/register.html');
});

app.post('/login', (req,res) => {
    console.log(req.body);
    res.redirect('/login.html');
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








