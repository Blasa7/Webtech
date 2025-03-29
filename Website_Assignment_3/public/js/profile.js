// Load initial checkbox values.
const req = new XMLHttpRequest();
req.onload = () => {
    const courses = req.responseText;
    const checkboxes = document.getElementsByClassName("profile-form__input--checkbox");

    for (let checkbox of checkboxes) {
        if (courses.includes(checkbox.value)){
            checkbox.setAttribute("checked", "checked");
        }
    }
}
req.open("GET", "student-courses")
req.send();



