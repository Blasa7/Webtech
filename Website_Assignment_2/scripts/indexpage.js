import * as li from './library.js';

class IndexPage extends li.Page {
    constructor(){
        super("index.html", "Student profile editor");
    }

    init() {
        super.init();
    }
}

document.onload = init();

function init() {
    let indexPage = new IndexPage();
    indexPage.init();
}

