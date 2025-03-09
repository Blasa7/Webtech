//const { json } = require('node:stream/consumers');

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

    makeElem() {
        let firstNameElem = createTextInput("First name:");
        firstNameElem.onchange = () => {
            this.firstName(firstNameElem.firstChild.nodeValue);
            firstNameElem.firstChild.nodeValue = this.firstName
        };

        let lastNameElem = createTextInput("Last name:");
        lastNameElem.onchange = () => {
            this.lastName(lastNameElem.firstChild.nodeValue);
            lastNameElem.firstChild.nodeValue = this.lastName
        };

        return [firstNameElem, lastNameElem];
    }

    stringify() {
        return JSON.stringify({
            ["firstName"]: this.#firstName,
            ["lastName"]: this.#lastName
        })
    }

    static parse(string){
        let obj = JSON.parse(string);

        let person = new Person();
        person.firstName = obj.firstName;
        person.lastName = obj.lastName;

        return person;
    }

    type(){
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

    makeElem() {
        let elems = super.makeElem();

        let ageElem = createTextInput("Age:");
        ageElem.onchange = () => {
            this.age(ageElem.firstChild.nodeValue);
            ageElem.firstChild.nodeValue = this.age;
        };

        return elems.concat([ageElem]);
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
        student.courses = Course.parse(obj.courses[0]);//obj.courses.map((value) => { Course.parse(value) });

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

var header = document.getElementsByTagName("header")[0];
var body = document.getElementsByTagName("body")[0];
var footer = document.getElementsByTagName("footer")[0];


var studentInfo;

document.onload = init()

//createStudentJsonFile();


function init() {
    // Header
    initHeader();

    // Body
    initBody();
    


    // Footer
    initFooter();
}

function initHeader(){
    const headerTitle = createElemWithText("h1", "Student profile editor");
    headerTitle.setAttribute("class", "header__title");
    header.appendChild(headerTitle);
}

function initBody(){
    const main = document.createElement("main");
    body.appendChild(main);

    var fileReader = document.createElement("input");
    fileReader.setAttribute("type", "file");
    main.appendChild(fileReader);
    fileReader.addEventListener("change", handleFileSelection);

    studentInfo = document.createElement("section")
    main.appendChild(studentInfo);
}

function initFooter(){

}

function handleFileSelection(e) {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = () => {
        //let student = parseString(reader.result);
        let student = Student.parse(reader.result);
        showStudent(student)
    }

    reader.readAsText(file)
}

// Displays student information in the body
function showStudent(student) {

    let form = document.createElement("form");

    student.makeElem().forEach((value) => { form.appendChild(value) });

    studentInfo.appendChild(form);
}

// Creates a element with the given tag and text contents
function createElemWithText(tagName, content) {
    let elem = document.createElement(tagName);
    let text = document.createTextNode(content);

    elem.appendChild(text);

    return elem;
}

function createTextInput(content) {
    let elem = document.createElement("input");
    let text = document.createTextNode(content);

    elem.type = "text";
    elem.appendChild(text);

    return elem;
}

function parseString(str) {
    res = JSON.parse(str);

    return res;
}

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

    //let json = JSON.stringify(student);
    let json = student.stringify();
    const fs = require('node:fs');
    fs.writeFileSync("student1.json", json)

}



