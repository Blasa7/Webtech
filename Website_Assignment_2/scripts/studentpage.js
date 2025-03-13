import * as li from './library.js';

class StudentPage extends li.Page {
    student;

    constructor() {
        super("students.html");
    }

    init() {
        super.init();

        this.initFileReader();
    }

    initFileReader() {
        var fileReader = document.createElement("input");
        fileReader.setAttribute("type", "file");
        this.main.appendChild(fileReader);
        fileReader.addEventListener("change", this.handleFileSelection.bind(this));
    }

    handleFileSelection(e) {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload =  () => {
            this.student = li.Student.parse(reader.result);
            this.showStudent();
        }

        reader.readAsText(file)
    }

    // Displays student information in the body
    showStudent() {
        let nameElem = li.createElemWithText("h1", this.student.firstName + " " + this.student.lastName);
        nameElem.className = "section__title"

        let studentInfo = document.createElement("ul");

        let age = li.createElemWithText("li", "Student age: " + this.student.age);
        let hobbies = li.createElemWithText("li", "Student hobbies: " + this.student.hobbies);
        let email = li.createElemWithText("li", "Student email: " + this.student.email);
        let major = li.createElemWithText("li", "Student major: " + this.student.major);

        studentInfo.appendChild(age);
        studentInfo.appendChild(hobbies);
        studentInfo.appendChild(email);
        studentInfo.appendChild(major);

        let photo = document.createElement("img");
        photo.src = this.student.photo
        photo.alt = "A photo of the student."
        photo.className = "section__img";

        this.main.appendChild(nameElem);
        this.main.appendChild(studentInfo);
        this.main.appendChild(photo);

        //TODO: image, courses

        let courseSectionTitle = li.createElemWithText("h2", "Student Courses");
        this.main.appendChild(courseSectionTitle);

        let courseList = document.createElement("ul");
        this.main.appendChild(courseList);

        this.student.courses.forEach(course => {
            let courseListItem = li.createElemWithText("li", course.title);
            courseListItem.className = "course-title";
            courseList.appendChild(courseListItem);

            let courseInfo = document.createElement("ul");
            courseInfo.className = "course-info";
            courseList.appendChild(courseInfo);

            let teacher = li.createElemWithText("li", "Course teacher: " + course.teacher.firstName + " " + course.teacher.lastName);
            courseInfo.appendChild(teacher);

            let description = li.createElemWithText("li", "Course description " + course.description);
            courseInfo.appendChild(description);
        });
    }
}

document.onload = init();

function init() {
    let studentPage = new StudentPage();
    studentPage.init();
}

