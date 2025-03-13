import * as li from './library.js';

class StudentPage extends li.Page {
    init() {
        super.init;
    }
}

document.onload = init();

function init() {
    let studentPage = new StudentPageePage();
    studentPage.init();
}

