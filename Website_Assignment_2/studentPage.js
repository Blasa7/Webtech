import * as li from './library.js';

class StudentPage extends li.Page {
    constructor(){
        super("students.html");
    }

    init() {
        super.init;
    }
}

document.onload = init();

function init() {
    let studentPage = new StudentPage();
    studentPage.init();
}

