// TODO: Style sheet should all be in js code, header, footer, image and course hover.

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
        student.courses = Course.parse(obj.courses[0]);

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

    init() {
        // Header
        this.initHeader();
    
        // Main
        this.initMain();
    
        // Footer
        this.initFooter();
    }
    
    initHeader() {
        this.header = document.createElement("header");
        this.header.className = "header";
        this.body.appendChild(this.header);
    
        const headerTitle = createElemWithText("h1", "Student profile editor");
        headerTitle.className = "header__title";
        this.header.appendChild(headerTitle);
    
        const nav = document.createElement("nav");
        this.header.appendChild(nav);
        const list = document.createElement("ul");
        nav.appendChild(list);
        nav.setAttribute("class", "header nav");
        list.setAttribute("class", "nav__list");
    
        const navBarClasses = ["nav__item", "nav__link"];
        const navBar = [["about.html", "About us"], ["contact.html", "Contact us"], ["courses.html","Courses"]];
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
        const styleButtons = document.createElement('p');
        const button1 = document.createElement('button');
        styleButtons.appendChild(button1);
        this.header.appendChild(styleButtons);
        styleButtons.className = "style__menu";
    
        //button1.onclick;
    }
    
    initMain() {
        this.main = document.createElement("main");
        this.main.className = "main-content";
        this.body.appendChild(this.main);
    
        this.initFileReader();
        //initForm();
    }
    
    initFooter() {
        this.footer = document.createElement("footer");
        this.footer.className = "footer";
        this.body.appendChild(this.footer);
    
        this.initElementPicker();
        this.initElementEditor();
        this.initFontFamilyPicker();
    }
    
    // Appends a select element to the footer that allowst selecting elements.
    initElementPicker() {
        this.elemPicker = document.createElement("select");
        this.elemPicker.onchange = () => { loadTagValues(); }
        this.elemPicker.className = "footer__menu";
    
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
    
        const fontSizeLabel = createElemWithText("label", "Font size:");
        this.fontSizeInput = document.createElement("input");
        this.fontSizeInput.onchange = this.setTagFontSize;
        elemEditor.appendChild(fontSizeLabel);
        elemEditor.appendChild(this.fontSizeInput);
    
        appendBreak(elemEditor);
    
        const fontColorLabel = createElemWithText("label", "Font color:");
        this.fontColorInput = document.createElement("input")
        this.fontColorInput.onchange = this.setTagColor;
        elemEditor.appendChild(fontColorLabel);
        elemEditor.appendChild(this.fontColorInput);
    
        appendBreak(elemEditor);
    
        this.footer.appendChild(elemEditor);
    }
    
    // Appends a select element to the footer that allows setting the font family.
    initFontFamilyPicker() {
        this.fontFamilyPicker = document.createElement('select');
        this.fontFamilyPicker.onchange = this.setFontFamily;
        this.fontFamilyPicker.setAttribute("id","font-select");
        const label = createElemWithText('label', "Font family:");
        label.setAttribute("for","font-select");
    
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
    
    
    // Loads the current values for the selected element in the element picker.
    loadTagValues() {
        let elems = document.getElementsByTagName(elemPicker.value);
    
        // If at least one of this type of element exists load its values.
        if (elems.length > 0) {
            this.fontSizeInput.value = elems.item(0).style.fontSize;
            this.fontColorInput.value = elems.item(0).style.color;
            this.fontFamilyPicker.value = elems.item(0).style.fontFamily; 
        }
        // Otherwise default to nothing.
        else {
            this.fontSizeInput.value = "";
            this.fontColorInput.value = "";
        }
    }
    
    setTagFontSize() {
        let elems = document.getElementsByTagName(elemPicker.value);
    
        for (i = 0; i < elems.length; i++) {
            elems.item(i).style.fontSize = fontSizeInput.value;
        }
    }
    
    setTagColor() {
        let elems = document.getElementsByTagName(elemPicker.value);
    
        for (i = 0; i < elems.length; i++) {
            elems.item(i).style.color = fontColorInput.value;
        }
    }
    
    setFontFamily() {
        let elems = document.getElementsByTagName(elemPicker.value);
    
        for (i = 0; i < elems.length; i++) {
            elems.item(i).style.fontFamily = fontFamilyPicker.value;
        }
    }
    
    
    initFileReader() {
        var fileReader = document.createElement("input");
        fileReader.setAttribute("type", "file");
        this.main.appendChild(fileReader);
        fileReader.addEventListener("change", this.handleFileSelection);
    }
    
    handleFileSelection(e) {
        const file = e.target.files[0];
    
        const reader = new FileReader();
        reader.onload = () => {
            this.student = Student.parse(reader.result);
            showStudent();
        }
    
        reader.readAsText(file)
    }
}

// Creates a element with the given tag and text contents
function createElemWithText(tagName, content) {
    let elem = document.createElement(tagName);
    let text = document.createTextNode(content);

    elem.appendChild(text);

    return elem;
}

function appendBreak(node) {
    const br = document.createElement("br");
    node.appendChild(br);
}

export {Page}
/*
// Main page components.
//var body = document.getElementsByTagName("body")[0];
//var header;
//var main;
var footer;

// Contains all student information.
var student;

// Element to select a element to edit the style of.
var elemPicker;

// Element values that can be edited.
var fontSizeInput;
var fontColorInput;
var fontFamilyPicker;

//document.onload = init(body);





// Displays student information in the body
function showStudent() {
    let nameElem = createElemWithText("h1", student.firstName + " " + student.lastName);
    nameElem.className = "section__title"

    let studentInfo = document.createElement("ul");

    let age = createElemWithText("li", "Student age: " + student.age);
    let hobbies = createElemWithText("li", "Student hobbies: " + student.hobbies);
    let email = createElemWithText("li", "Student email: " + student.email);
    let major = createElemWithText("li", "Student major: " + student.major);

    studentInfo.appendChild(age);
    studentInfo.appendChild(hobbies);
    studentInfo.appendChild(email);
    studentInfo.appendChild(major);

    let photo = document.createElement("img");
    photo.src = student.photo
    photo.alt = "A photo of the student."
    photo.className = "section__img";

    main.appendChild(nameElem);
    main.appendChild(studentInfo);
    main.appendChild(photo);

    //TODO: image, courses
    let course = student.courses;
    let courseTeacher = student.courses.teacher;
    let courseName = createElemWithText("h1", course.title);
    courseName.className = "section__title";

    let courseInfo = document.createElement('ul');
    let coTeacher = createElemWithText('li', "Teacher:" + courseTeacher.firstName + " " + courseTeacher.lastName);
    let courseDescription = createElemWithText('li', "Description: " + course.description);
    courseInfo.appendChild(coTeacher);
    courseInfo.appendChild(courseDescription);

    main.appendChild(courseName);
    main.appendChild(courseInfo);
}

// Creates a element with the given tag and text contents
// function createElemWithText(tagName, content) {
//     let elem = document.createElement(tagName);
//     let text = document.createTextNode(content);

//     elem.appendChild(text);

//     return elem;
// }

//export {createElemWithText}


function appendBreak(node) {
    const br = document.createElement("br");
    node.appendChild(br);
}

// // Used to create the first json file in correct format.
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
// function initForm() {
//     const studentForm = document.createElement("form");
//     main.appendChild(studentForm);

//     const studentInfoArray = ['label', ["Student Name: ", "Student Age: ", "Hobbies: ", "Email: ", "Major: "]]
//     let l = studentInfoArray[1].length;
//     console.log(l);
//     for (let i = 0; i < l; i++) {
//         const par = document.createElement('p');
//         studentForm.appendChild(par);
//         const label = createElemWithText('label', studentInfoArray[1][i]);
//         const input = document.createElement('input');
//         label.setAttribute
//         par.appendChild(label);
//         par.appendChild(input);
//     }

//     const button = document.createElement('button');
//     button.setAttribute("type", "submit");
//     button.setAttribute('style', "height:20px; width:60px")
//     const text = document.createTextNode("submit");
//     button.appendChild(text);
//     studentForm.appendChild(button);
// }



*/