import * as lib from './lib.js'
// Load header nav and footer from lib.
lib.makeHeader('Your Profile');
lib.makeFooter('');

// Load initial checkbox values.
const reqCourses = new XMLHttpRequest();
reqCourses.onload = () => {
    const courses = reqCourses.responseText;
    const checkboxes = document.getElementsByClassName("profile-form__input--checkbox");

    for (let checkbox of checkboxes) {
        if (courses.includes(checkbox.value)) {
            checkbox.setAttribute("checked", "checked");
        }
    }
}
reqCourses.open("GET", "student-courses");
reqCourses.send();

// Set dropdown to current student program.
const reqProgram = new XMLHttpRequest();
reqProgram.onload = () => {
    const program = JSON.parse(reqProgram.responseText).program;
    const options = document.getElementsByClassName("profile-form__dropdown-option")

    for (let option of options) {
        if (option.value == program) {
            option.setAttribute("selected", "selected");
        }
    }
}
reqProgram.open("GET", "student-program-id");
reqProgram.send();


// Fetch the photo and display it. Not all formats work .png does.
const reqPhoto = new XMLHttpRequest();
reqPhoto.responseType = "blob";
reqPhoto.onload = () => {
    const blob = reqPhoto.response;

    if (blob) {
        const photoURL = URL.createObjectURL(blob);

        document.getElementById("profile-photo").src = photoURL;
    }
}
reqPhoto.open("GET", `student-photo`);
reqPhoto.send();






