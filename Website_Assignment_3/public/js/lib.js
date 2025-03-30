class Student {
    name;
    age;
    email;
    hobbies;
    photo;
    program;
    courses;

    constructor(name, age, email, hobbies, photo, program, courses) {
        this.name = name;
        this.age = age;
        this.email = email;
        this.hobbies = hobbies;
        this.photo = photo;
        this.program = program;
        this.courses = courses;
    }
}

class Program {
    title;
    description;

    constructor(title, description) {
        this.title = title;
        this.description = description;
    }
}

class Course {
    title;
    description;
    teacher;

    constructor(title, description, teacher) {
        this.title = title;
        this.description = description;
        this.teacher = teacher;
    }
}

// Some template html that is shared between pages.
function makeHeader(title) {
    const header = document.getElementById('header');
    header.className = "header";

    const headerTitle = createElemWithText("h1", title);
    headerTitle.class = "header__title";
    header.appendChild(headerTitle);

    const nav = document.createElement('nav');
    nav.id = 'nav';
    header.appendChild(nav);
    makeNav();
}

function makeNav() {
    const nav = document.getElementById('nav');
    nav.className = 'nav';

    const list = document.createElement("ul");
    list.className = 'nav__list';
    nav.appendChild(list);

    let navBar = [
        ["Profile", "/profile"], 
        ["Course Overview", "/course-overview"], 
    ];

    for (let i = 0; i < navBar.length; i++) {
        const listNode = document.createElement("li");
        listNode.className = 'nav__item';
        list.appendChild(listNode);

        const link = createElemWithText("a", navBar[i][0]);
        link.className = 'nav__link';
        link.setAttribute("href", navBar[i][1]);
        listNode.appendChild(link);
    }
}

function makeFooter() {
    const footer = document.getElementById('footer')
}

// Creates a element with the given tag and text contents
function createElemWithText(tagName, content) {
    let elem = document.createElement(tagName);
    let text = document.createTextNode(content);

    elem.appendChild(text);

    return elem;
}

export { Student, Program, Course, makeHeader, makeNav, makeFooter }
