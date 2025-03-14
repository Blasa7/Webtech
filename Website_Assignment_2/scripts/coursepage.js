import * as li from './library.js';

class CoursePage extends li.Page {
    courses;

    constructor(){
        super("courses.html", "Courses");
    }

    init() {
        super.init();

        this.initFileReader();
    }

    initFileReader() {
        let label = li.createElemWithText("label", "Please choose a courses .json file: ");
        label.setAttribute("for", "courses-file-reader");
        this.main.appendChild(label);

        let fileReader = document.createElement("input");
        fileReader.type = "file";
        fileReader.id = "courses-file-reader";
        this.main.appendChild(fileReader);
        fileReader.addEventListener("change", this.handleFileSelection.bind(this));
    }

    handleFileSelection(e) {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload =  () => {
            let obj = JSON.parse(reader.result);

            this.courses = obj.courses.map((course) => li.Course.parse(course));
            this.showCourse();
        }

        reader.readAsText(file)
    }

    showCourse(){
        let courseSectionTitle = li.createElemWithText("h2", "Student Courses");
        this.main.appendChild(courseSectionTitle);

        let courseList = document.createElement("ul");
        let courseSection = document.createElement('section');
        courseSection.appendChild(courseList);
        this.main.appendChild(courseSection);

        this.courses.forEach(course => {
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
    let coursePage = new CoursePage();
    coursePage.init();
}

