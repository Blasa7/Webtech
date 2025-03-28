
import { selectUserPosts, getUserId} from "../db.js";

// content for ejs template 
function createProfilePage(document, username) {
    const body = document.body;
    const header = document.createElement('header');
    body.appendChild(header);
    header.setAttribute('class','header');
    const main = document.createElement('main');
    body.appendChild(main);

    const headerText = document.createElement('h1');
    header.appendChild(headerText);
    const headerTextNode = document.createTextNode(`Welcome ${username}`);
    headerText.appendChild(headerTextNode);

    loadPageContent(main, document, username);
}

export {createProfilePage}; 

function initHeader() {
}

function initMenu() {
}

function loadPageContent(node, document, username) {
    loadPosts(node, document, username);
}

// Displays all posts of one user.
function loadPosts(node, document, username) {
    // select posts 
    const userId = getUserId(username);
    const posts = selectUserPosts(userId);
    // console.log(posts);
    
    // display posts
    posts.forEach((post) => {
        displayPost(node, document, post);
    });
}

// Displays one post.
function displayPost(node, document, post) {
    const postContainer = document.createElement('div');
    postContainer.setAttribute('class', 'post');
    node.appendChild(postContainer);

    const title = document.createElement('h3');
    title.setAttribute('class', 'post--title');
    const titleTextNode = document.createTextNode(post.title);
    title.appendChild(titleTextNode);
    
    const text = document.createElement('p');
    text.setAttribute('class', 'post--text');
    const textTextNode = document.createTextNode(post.text);
    text.appendChild(textTextNode);

    postContainer.appendChild(title);
    postContainer.appendChild(text);
}
