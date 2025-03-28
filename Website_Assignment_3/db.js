
import Database from 'better-sqlite3';

// insertUserPosts();
// insertUsers();
// createUserPostsTable();

// Defines user_posts table
function createUserPostsTable() {
    const db = new Database('app.db');
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
    db.close();
    console.log("User posts table created.");
}




// Selects all posts of a user.
function selectUserPosts(userid) {
    const db = new Database('app.db');
    const userPosts = db.prepare('SELECT * FROM user_posts WHERE user_id = ?').all(userid);
    db.close();
    return userPosts; 
}

// Returns user id based on username.
function getUserId(username) {
    const db = new Database('app.db');
    const userId = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    db.close();
    return userId.id; 
}

// Returns user based on username.
function selectUser(username) {
    const db = new Database('app.db');
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    console.log(user);
    db.close();
    return user; 
}

export {selectUserPosts, getUserId}; 



// add user posts
function insertUserPosts() {
    const db = new Database('app.db');
    const data = [
        {userid: 1, title: "My first post", text: "This is the body of post 1."},
        {userid: 1, title: "My second post", text: "This is the body of post 2."},
        {userid: 1, title: "My third post", text: "This is the body of post 3."},
        {userid: 2, title: "First post", text: "This is content." },
        {userid: 2, title: "Second post", text: "This is content also content."},
        {userid: 3, title: "Trees", text: `A tree is a perennial plant with an elongated stem, 
            or trunk, usually supporting branches and leaves.`},
        {userid: 3, title: "Leaves", text: "Leaves use photosynthesis to produce oxygen."},
        {userid: 3, title: "Roots", text: "Roots reach into the earth."}
    ];
    const insertData = db.prepare("INSERT INTO user_posts (user_id, title, text) VALUES (?, ?, ?)"); 
    data.forEach((post) => {
        insertData.run(post.userid, post.title, post.text);
    });
    db.close();
    console.log("Posts inserted");
}

// Adds users to the users table 
function insertUsers() {
    const db = new Database('app.db');
    const data = [
        {username: "Elmo", password: "3433"},
        {username: "Groot", password: "fantastic"},
        {username: "mrBean", password: "belligerent"}
    ];
    const insertData = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)"); 
    data.forEach((user) => {
        insertData.run(user.username, user.password);
    });
    db.close();
    console.log("Users inserted");
    logAllUsers();
}

// Logs all users
function logAllUsers() {
    const db = new Database('app.db');
    const query = `SELECT * FROM users`;
    const users = db.prepare(query).all();
    console.log(users);
    db.close();
}
