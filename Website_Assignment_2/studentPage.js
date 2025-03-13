
import * as li from './library.js';

class CoursePage extends li.Page {
    init(){
        super.init;
    }
}

document.onload = init();

function init() {
    let coursePage = new CoursePage();
    coursePage.init();

    //li.initHeader(headerString, body, navBar);
    //li.initMain(body);
}

