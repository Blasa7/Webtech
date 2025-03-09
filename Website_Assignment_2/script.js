class Person{
    firstName;
    lastName;
}

class Student extends Person{
    age;
    hobbies;
    email;
    photo;
    major;
    courses;
}

class Course{
    title;
    teacher;
    description;
}

var header = document.getElementsByTagName("header")[0];
var body = document.getElementsByTagName("body")[0];
var footer = document.getElementsByTagName("footer")[0];


var studentInfo;

document.onload = init()

function init(){
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

function handleFileSelection(e){
    const file = e.target.files[0];
    
    const reader = new FileReader();
    reader.onload = () => {
        let student = parseString(reader.result);

        showStudent(student)
    }

    reader.readAsText(file)
}

// Displays student information in the body
function showStudent(student){
    let studentName = createElemWithText("h1", student.firstName + " " + student.lastName);

    let studentInfoList = document.createElement("ul")

    let age = createElemWithText("li", "Student age: " + student.age);
    studentInfoList.appendChild(age);

    let hobbies = createElemWithText("li", "Student hobbies: " + student.hobbies);
    studentInfoList.appendChild(hobbies);

    let email = createElemWithText("li", "Student email: " + student.email);
    studentInfoList.appendChild(email);

    //let photo = createElemWithText("li", "Student photo: " + student.photo);
    let photo = createImg(student.photo, "A photo of the student.", "section__img")
    studentInfoList.appendChild(photo);

    let major = createElemWithText("li", "Student major: " + student.major);
    studentInfoList.appendChild(major);

    let courses = createElemWithText("li", "Student courses: " + student.courses);
    studentInfoList.appendChild(courses)

    //studentInfo.replaceChildren([studentName, studentInfoList])
    studentInfo.appendChild(studentName);
    studentInfo.appendChild(studentInfoList)
    studentInfo.appendChild(photo)
}

// Creates a element with the given tag and text contents
function createElemWithText(tagName, content){
    let elem = document.createElement(tagName);
    let text = document.createTextNode(content);

    elem.appendChild(text);

    return elem;
}

function createImg(src, alt, className){
    let elem = document.createElement("img");
    elem.setAttribute("src", src);
    elem.setAttribute("alt", alt);
    elem.setAttribute("class", className)

    return elem;
}

function parseString(str){
    res = JSON.parse(str);
    
    return res;
}

// Used to create the first json file in correct format.
function createStudentJsonFile(){
    let teacher = new Person();
    teacher.firstName = "..";
    teacher.lastName = "..";

    let course = new Course();
    course.title = "Webtech";
    course.teacher = teacher; 
    course.description = "Course about webtech."; 

    let student = new Student()
    student.firstName = "Floris"
    student.lastName = "Gruijter"
    student.age = 21;
    student.hobbies = ["Gaming"]
    student.email = "f.t.degruijter@students.uu.nl";
    student.photo = "\images\ftg.jpg";
    student.major = "Computer science"
    student.courses = [course]

    let json = JSON.stringify(student);
    
    const fs = require('node:fs');
    fs.writeFileSync("student1.json", json)
    
}



