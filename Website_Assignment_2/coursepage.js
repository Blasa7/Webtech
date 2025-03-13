import * as li from './library.js';

// const body = document.getElementsByTagName("body")[0];

// const headerString = "Courses";
// const navBar = [["index.html", "Main"], ["about.html", "About us"], ["contact.html", "Contact us"],];

class CoursePage extends li.Page {
    init(){
        super.init();
    }
}

document.onload = init();

function init() {
    let coursePage = new CoursePage();
    coursePage.init();

    //li.initHeader(headerString, body, navBar);
    //li.initMain(body);
}

