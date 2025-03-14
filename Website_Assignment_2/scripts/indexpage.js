import * as li from './library.js';

class IndexPage extends li.Page {
    constructor(){
        super("index.html", "Student profile editor");
    }

    init() {
        super.init();
        this.initSection();
    }
    initSection() {
        const section = document.createElement('section');
        const sectionTitle = li.createElemWithText('h2',"Section Title");
        const sectionText = document.createTextNode(`Nam cum essem in Puteolano Hirtiusque noster, 
            consul designatus, isdem in locis, vir nobis amicissimus et his studiis, 
            in quibus nos a pueritia viximus, deditus, multum una eramus, maxime nos quidem exquirentes ea consilia, 
            quae ad pacem et ad concordiam civium pertinerent. Cum enim omnes post interitum Caesaris 
            novarum perturbationum causae quaeri viderentur iisque esse occurrendum putaremus, 
            omnis fere nostra in his deliberationibus consumebatur oratio, idque et saepe alias et 
            quodam liberiore, quam solebat, et magis vacuo ab interventoribus die, cum ad me ille venisset, 
            primo ea, quae erant cotidiana et quasi legitima nobis, de pace et de otio.`);
        section.appendChild(sectionTitle);
        section.appendChild(sectionText);
        this.main.appendChild(section);
    }
}

document.onload = init();

function init() {
    let indexPage = new IndexPage();
    indexPage.init();
}

