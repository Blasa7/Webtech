class Person {
    #firstName;
    #lastName;

    get firstName() {
        return this.#firstName;
    }

    set firstName(string) {
        if (this.#isName(string)) {
            this.#firstName = string;
        }
    }

    get lastName() {
        return this.#lastName;
    }

    set lastName(string) {
        if (this.#isName(string)) {
            this.#lastName = string;
        }
    }

    // Checks that a string contains only letters and starts with an uppercase
    #isName(string) {
        let match = /[A-Z][a-z]*/

        return match.test(string);
    }

    stringify() {
        return JSON.stringify({
            ["firstName"]: this.#firstName,
            ["lastName"]: this.#lastName
        })
    }

    static parse(string) {
        let obj = JSON.parse(string);

        let person = new Person();
        person.firstName = obj.firstName;
        person.lastName = obj.lastName;

        return person;
    }

    type() {
        return "Person";
    }
}

class Student extends Person {
    #age;
    #hobbies;
    #email;
    #photo;
    #major;
    #courses;

    get age() {
        return this.#age;
    }

    // Check number is positive and whole
    set age(number) {
        if (number >= 0 && number % 1 == 0) {
            this.#age = number;
        }
    }

    get hobbies() {
        return this.#hobbies;
    }

    set hobbies(strings) {
        let isArray = Array.isArray(strings);
        let isLettersArray = isArray ? strings.every((value) => { return /[a-z]*/i.test(value); }) : false;

        if (isArray && isLettersArray) {
            this.#hobbies = strings;
        }
    }

    get email() {
        return this.#email;
    }

    set email(string) {
        //Basic email pattern not exhastive, so some invalid emails may still be possible
        let match = /.*@.*\..*/

        if (match.test(string)) {
            this.#email = string;
        }
    }

    get photo() {
        return this.#photo;
    }

    set photo(string) {
        // Matches some of the more common image file extensions
        let match = /.*(.gif|.jpeg|.apng|.png|.avif|.jpg|.webp|.jfif|.pjpeg|.pjp)/

        if (match.test(string)) {
            this.#photo = string;
        }
    }
    get major() {
        return this.#major;
    }

    set major(string) {
        if (typeof string == "string") {
            this.#major = string;
        }
    }

    get courses() {
        return this.#courses;
    }

    set courses(courses) {
        let isArray = Array.isArray(courses);
        let isCourseArray = isArray ? courses.every((value) => { return value.type() == "Course"; }) : false;

        if (isArray && isCourseArray) {
            this.#courses = courses;
        }
    }

    stringify() {
        // Get the properties from person
        let pers = JSON.parse(super.stringify());
        // Get the properties from student
        let stud = {
            ["age"]: this.#age,
            ["hobbies"]: this.#hobbies,
            ["email"]: this.#email,
            ["photo"]: this.#photo,
            ["major"]: this.#major,
            ["courses"]: this.#courses.map((course) => { return course.stringify(); })
        }
        // Combine the properties from person and student
        return JSON.stringify(Object.assign(pers, stud));
    }

    static parse(string) {
        let obj = JSON.parse(string);

        let student = new Student();
        student.firstName = obj.firstName;
        student.lastName = obj.lastName;
        student.age = obj.age;
        student.hobbies = obj.hobbies;
        student.email = obj.email;
        student.photo = obj.photo;
        student.major = obj.major;
        student.courses = obj.courses.map(Course.parse);

        return student;
    }

}

class Course {
    #title;
    #teacher;
    #description;

    get title() {
        return this.#title;
    }

    set title(string) {
        if (typeof string == "string") {
            this.#title = string;
        }
    }

    get teacher() {
        return this.#teacher;
    }

    set teacher(person) {
        if (person.type() == "Person") {
            this.#teacher = person;
        }
    }

    get description() {
        return this.#description;
    }

    set description(string) {
        if (typeof string == "string") {
            this.#description = string;
        }
    }

    stringify() {
        return JSON.stringify({
            ["title"]: this.#title,
            ["teacher"]: this.#teacher.stringify(),
            ["description"]: this.#description
        })
    }

    static parse(string) {
        let obj = JSON.parse(string)

        let course = new Course();
        course.title = obj.title;
        course.teacher = Person.parse(obj.teacher);
        course.description = obj.description;

        return course;
    }

    type() {
        return "Course";
    }
}

class Page {
    href;

    // Main page components.
    body = document.getElementsByTagName("body")[0];
    header;
    main;
    footer;

    // Element to select a element to edit the style of.
    elemPicker;

    // Element values that can be edited.
    fontSizeInput;
    fontColorInput;
    fontFamilyPicker;

    // Page specific 
    headerString;

    constructor(href, headerString) {
        this.href = href;
        this.headerString = headerString;
    }

    init() {
        // Header
        this.initHeader();

        // Nav
        this.initNav();

        // Main
        this.initMain();

        // Footer
        this.initFooter();
    }

    initHeader() {
        this.header = document.createElement("header");
        this.header.className = "header";
        const headerTitle = createElemWithText("h1", this.headerString);
        headerTitle.className = "header__title";
        this.header.appendChild(headerTitle);
        this.body.appendChild(this.header);
    }

    initNav() {
        const nav = document.createElement("nav");
        this.header.appendChild(nav);
        const list = document.createElement("ul");
        nav.appendChild(list);
        nav.setAttribute("class", "nav");
        list.setAttribute("class", "nav__list");

        const navBarClasses = ["nav__item", "nav__link"];
        let navBar = [["index.html", "Home"], ["students.html", "Students"], ["courses.html", "Courses"]];

        let l = navBar.length;
        for (let i = 0; i < l; i++) {
            const listNode = document.createElement("li");
            const link = createElemWithText("a", navBar[i][1]);
            listNode.setAttribute("class", navBarClasses[0]);
            link.setAttribute("class", navBarClasses[1]);
            link.setAttribute("href", navBar[i][0]);
            listNode.appendChild(link);
            list.appendChild(listNode);
        }
    }

    initMain() {
        this.main = document.createElement("main");
        this.main.className = "main-content";
        this.body.appendChild(this.main);
    }

    initFooter() {
        this.footer = document.createElement("footer");
        this.footer.className = "footer";
        this.body.appendChild(this.footer);

        this.initElementPicker();
        this.initElementEditor();
        this.initFontFamilyPicker();

        this.initFooterLogo();
    }

    // Appends a select element to the footer that allowst selecting elements.
    initElementPicker() {
        const elemPickerLabel = createElemWithText("label", "Choose element: ");
        elemPickerLabel.setAttribute("for", "element-picker");
        this.footer.appendChild(elemPickerLabel);

        this.elemPicker = document.createElement("select");
        this.elemPicker.className = "footer__menu";
        this.elemPicker.id = "element-picker";

        const bodyOption = createElemWithText("option", "Body");
        bodyOption.value = "body";
        this.elemPicker.appendChild(bodyOption);

        const articleOption = createElemWithText("option", "Article");
        articleOption.value = "article";
        this.elemPicker.appendChild(articleOption);

        const sectionOption = createElemWithText("option", "Section");
        sectionOption.value = "section";
        this.elemPicker.appendChild(sectionOption);

        this.footer.appendChild(this.elemPicker);
    }

    // Appends a form to the footer that allows editing the selected element.
    initElementEditor() {
        const elemEditor = document.createElement("form");
        elemEditor.addEventListener("submit", (e) => { e.preventDefault() }); //Prevent page reload on submit.

        const fontSizeLabel = createElemWithText("label", "Font size: ");
        fontSizeLabel.setAttribute("for", "font-size-input");

        this.fontSizeInput = document.createElement("input");
        this.fontSizeInput.onchange = this.setTagFontSize.bind(this);
        this.fontSizeInput.id = "font-size-input";

        elemEditor.appendChild(fontSizeLabel);
        elemEditor.appendChild(this.fontSizeInput);

        appendBreak(elemEditor);

        const fontColorLabel = createElemWithText("label", "Font color: ");
        fontColorLabel.setAttribute("for", "font-color-input");

        this.fontColorInput = document.createElement("input");
        this.fontColorInput.type = "color";
        this.fontColorInput.oninput = this.setTagColor.bind(this);
        this.fontColorInput.id = "font-color-input";

        elemEditor.appendChild(fontColorLabel);
        elemEditor.appendChild(this.fontColorInput);

        appendBreak(elemEditor);

        this.footer.appendChild(elemEditor);
    }

    // Appends a select element to the footer that allows setting the font family.
    initFontFamilyPicker() {
        this.fontFamilyPicker = document.createElement('select');
        this.fontFamilyPicker.onchange = this.setFontFamily.bind(this);
        this.fontFamilyPicker.setAttribute("id", "font-select");
        const label = createElemWithText('label', "Font family: ");
        label.setAttribute("for", "font-select");

        const fontOption1 = createElemWithText("option", "Arial");
        fontOption1.value = "arial";
        this.fontFamilyPicker.appendChild(fontOption1);

        const fontOption2 = createElemWithText("option", "Serif");
        fontOption2.value = "serif";
        this.fontFamilyPicker.appendChild(fontOption2);

        const fontOption3 = createElemWithText("option", "Cursive");
        fontOption3.value = "cursive";
        this.fontFamilyPicker.appendChild(fontOption3);

        const fontOption4 = createElemWithText("option", "Arial");
        fontOption4.value = "arial";
        this.fontFamilyPicker.appendChild(fontOption4);

        const fontOption5 = createElemWithText("option", "Emoji");
        fontOption5.value = "emoji";
        this.fontFamilyPicker.appendChild(fontOption5);

        this.footer.appendChild(label);
        this.footer.appendChild(this.fontFamilyPicker);
    }

    initFooterLogo(){
        const logo = document.createElement("img");
        logo.className = "footer__img";
        logo.alt = "Utrecht Univesity logo";
        logo.src = "images/uu.png";
        this.footer.appendChild(logo);
    }

    setTagFontSize() {
        let elems = document.getElementsByTagName(this.elemPicker.value);

        for (let i = 0; i < elems.length; i++) {
            elems.item(i).style.fontSize = this.fontSizeInput.value;
        }
    }

    setTagColor() {
        let elems = document.getElementsByTagName(this.elemPicker.value);

        for (let i = 0; i < elems.length; i++) {
            elems.item(i).style.color = this.fontColorInput.value;
        }
    }

    setFontFamily() {
        let elems = document.getElementsByTagName(this.elemPicker.value);

        for (let i = 0; i < elems.length; i++) {
            elems.item(i).style.fontFamily = this.fontFamilyPicker.value;
        }
    }
}

// Creates a element with the given tag and text contents
function createElemWithText(tagName, content) {
    let elem = document.createElement(tagName);
    let text = document.createTextNode(content);

    elem.appendChild(text);

    return elem;
}

// Appends a break line to the given element.
function appendBreak(node) {
    const br = document.createElement("br");
    node.appendChild(br);
}

// Creates a section and appends it to the given element.
function createSection(title, string, node, h = "h2") {
    const section = document.createElement('section');
    const sectionTitle = li.createElemWithText(h, title);
    const sectionText = document.createTextNode(string);
    section.appendChild(sectionTitle);
    section.appendChild(sectionText);
    node.appendChild(section);
}

// Creates an article and appends it to the given element.
function createArticle(title, string, node, h = "h2") {
    const article = document.createElement('article');
    const articleTitle = li.createElemWithText(h, title);
    const articleText = document.createTextNode(string);
    article.appendChild(articleTitle);
    article.appendChild(articleText);
    node.appendChild(article);
}


export { Person, Student, Course, Page, createElemWithText, appendBreak, createSection, createArticle }


// Used to create the first json file in correct format.
function createStudentJsonFile() {
    let teacher = new Person();
    teacher.firstName = "John";
    teacher.lastName = "Johns";

    let course = new Course();
    course.title = "Webtech";
    course.teacher = teacher;
    course.description = "Course about webtech.";

    let student = new Student()
    student.firstName = "Floris"
    student.lastName = "Gruijter"
    student.age = 21;
    student.hobbies = ["Gaming", "Programming"]
    student.email = "f.t.degruijter@students.uu.nl";
    student.photo = "\images\ftg.jpg";
    student.major = "Computer science"
    student.courses = [course]

    let json = student.stringify();
    const fs = require('node:fs');
    fs.writeFileSync("student1.json", json)
}

// Creates a form for entering student information
function initForm() {
    const studentForm = document.createElement("form");
    main.appendChild(studentForm);

    const studentInfoArray = ['label', ["Student Name: ", "Student Age: ", "Hobbies: ", "Email: ", "Major: "]]
    let l = studentInfoArray[1].length;
    console.log(l);
    for (let i = 0; i < l; i++) {
        const par = document.createElement('p');
        studentForm.appendChild(par);
        const label = createElemWithText('label', studentInfoArray[1][i]);
        const input = document.createElement('input');
        label.setAttribute
        par.appendChild(label);
        par.appendChild(input);
    }

    const button = document.createElement('button');
    button.setAttribute("type", "submit");
    button.setAttribute('style', "height:20px; width:60px")
    const text = document.createTextNode("submit");
    button.appendChild(text);
    studentForm.appendChild(button);
}