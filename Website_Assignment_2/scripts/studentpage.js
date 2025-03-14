import * as li from './library.js';

class StudentPage extends li.Page {
    student;

    updateNotification;

    constructor() {
        super("students.html", "Students");
    }

    init() {
        super.init();

        this.initFileReader();
    }

    initFileReader() {
        let form = document.createElement("form");
        this.main.appendChild(form);

        let label = li.createElemWithText("label", "Please choose a student .json file: ");
        label.setAttribute("for", "student-file-reader");
        form.appendChild(label);

        let fileReader = document.createElement("input");
        fileReader.type = "file";
        fileReader.id = "student-file-reader";
        form.appendChild(fileReader);
        fileReader.addEventListener("change", this.handleFileSelection.bind(this));

        // Event bubling since the update animation is triggered after the file is loaded.
        form.onchange = (e)=> {
            if (typeof this.updateNotification !== "undefined"){
                this.updateNotification.remove();
            }
            this.updateNotification = li.createElemWithText("p", "Loaded!");
            form.appendChild(this.updateNotification);
            this.updateNotification.className = "main-content__update-notification";
            this.updateNotification.style.opacity = 0;
        };
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
        let studentSection = document.createElement('section');
        studentSection.appendChild(studentInfo);

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
        this.main.appendChild(studentSection);
        this.main.appendChild(photo);

        let courseSectionTitle = li.createElemWithText("h2", "Student Courses");
        this.main.appendChild(courseSectionTitle);

        let courseList = document.createElement("ul");
        let courseSection = document.createElement('section');
        courseSection.appendChild(courseList);
        this.main.appendChild(courseSection);

        this.student.courses.forEach(course => {
            let courseListItem = li.createElemWithText("li", course.title);
            courseListItem.className = "course-title";
            courseList.appendChild(courseListItem);

            let courseInfo = document.createElement("ul");
            courseInfo.className = "course-info";
            courseList.appendChild(courseInfo);

            let teacher = li.createElemWithText("li", "Course teacher: " + course.teacher.firstName + " " + course.teacher.lastName);
            courseInfo.appendChild(teacher);

            let description = li.createElemWithText("li", "Course description: " + course.description);
            courseInfo.appendChild(description);
        });
    }
}

document.onload = init();

function init() {
    let studentPage = new StudentPage();
    studentPage.init();
}

