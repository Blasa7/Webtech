import * as li from './library.js';

class IndexPage extends li.Page {
    constructor(){
        super("index.html", "Student profile editor");
    }

    init() {
        super.init();
        this.initSection();
        this.initArticle();
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
    initArticle() {
        const article = document.createElement('article');
        const articleTitle = li.createElemWithText('h2',"Article Title");
        const articleText = document.createTextNode(`Quibus actis, Quid ergo? inquit ille, 
            quoniam oratorias exercitationes non tu quidem, ut spero, reliquisti, 
            sed certe philosophiam illis anteposuisti, possumne aliquid audire? Tu vero, 
            inquam, vel audire vel dicere; nec enim, id quod recte existimas, oratoria illa 
            studia deserui, quibus etiam te incendi, quamquam flagrantissumum acceperam, nec ea, 
            quae nunc tracto, minuunt, sed augent potius illam facultatem. Nam cum hoc genere philosophiae, 
            quod nos sequimur, magnam habet orator societatem; subtilitatem enim ab Academia mutuatur et ei 
            vicissim reddit ubertatem orationis et ornamenta dicendi. Quam ob rem, inquam, quoniam utriusque 
            studii nostra possessio est, hodie, utro frui malis, optio sit tua. Tum Hirtius: Gratissumum, inquit, 
            et tuorum omnium simile; nihil enim umquam abnuit meo studio voluntas tua.`);
        article.appendChild(articleTitle);
        article.appendChild(articleText);
        this.main.appendChild(article);
    }
}

document.onload = init();

function init() {
    let indexPage = new IndexPage();
    indexPage.init();
}

