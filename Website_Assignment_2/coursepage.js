
import * as li from './library.js';

const body = document.getElementsByTagName("body")[0];

const headerString = "Courses";
const navBar = [["index.html","Main"],["about.html", "About us"], ["contact.html", "Contact us"], ];

document.onload = init();

function init(){
    li.initHeader(headerString,body,navBar);
    li.initMain(body);
}
