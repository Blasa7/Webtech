// Template for a student containing relevant information.
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

// Template for a program containing relevant information.
class Program {
    title;
    description;

    constructor(title, description) {
        this.title = title;
        this.description = description;
    }
}

// Template for a course containing relevant information.
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

// Makes the header element with DOM manipulation.
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

// Makes the navigation element with DOM manipulation.
function makeNav() {
    const nav = document.getElementById('nav');
    nav.className = 'nav';

    const list = document.createElement("ul");
    list.className = 'nav__list';
    nav.appendChild(list);

    let navBar = [
        ['Profile', '/profile'], 
        ['Course Overview', '/course-overview'],
        ['Friends Overview', '/friends-overview'] 
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

// Makes the foorter with DOM manipulation.
function makeFooter(pathOffset) {
    const footer = document.getElementById('footer');
    footer.className = "footer";

    const text = createElemWithText('p', 'Floris de Gruijter - Abracha Koens - Nicolas Penders')
    footer.appendChild(text);

    const logo = document.createElement('img');
    logo.className = 'footer__img';
    logo.alt = 'Utrecht Univesity logo';
    logo.src = pathOffset + 'images/uu.png';
    footer.appendChild(logo);
}

// Creates a element with the given tag and text contents
function createElemWithText(tagName, content) {
    let elem = document.createElement(tagName);
    let text = document.createTextNode(content)

    elem.appendChild(text);

    return elem;
}

export { Student, Program, Course, makeHeader, makeNav, makeFooter }
