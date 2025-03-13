import * as li from './library.js';

class CoursePage extends li.Page {
    constructor(){
        super("courses.html");
    }

    init() {
        super.init();
    }
}

document.onload = init();

function init() {
    let coursePage = new CoursePage();
    coursePage.init();
}

