import * as li from './library.js';

class IndexPage extends li.Page {
    constructor(){
        super("index.html", "Student profile editor");
    }

    init() {
        super.init();
        this.initArticle();
    }

    initArticle() {
        const article = document.createElement('article');
        const articleTitle = li.createElemWithText('h2',"The website");
        const articleText = document.createTextNode(`On this website you can view student profiles and course descriptions.
            The Website consists of three pages, namely; the index page that you are currently on, the students page where 
            you can view student profiles and the courses page where you can view course descriptions.`);
        article.appendChild(articleTitle); 
        article.appendChild(articleText);
        this.main.appendChild(article);

        const section1 = document.createElement('section');
        const section1Title = li.createElemWithText('h3',"Students page");
        const section1Text = document.createTextNode(`On the students page you can view student profiles. 
            This can be done by loading in json student files. A number of sample student files are contained in the folder .\\students.
            By clicking on the select file button you can navigate to the file and select it to view its contents in a readable manner.`);
        section1.appendChild(section1Title);
        section1.appendChild(section1Text);
        article.appendChild(section1);

        const section2 = document.createElement('section');
        const section2Title = li.createElemWithText('h3',"Courses page");
        const section2Text = document.createTextNode(`On the courses page you can view a list of course summaries.
             Simmilarly to student profiles you can select a courses json file. An example files has been prepared under .\\courses.
             By hovering the mouse cursor over course titles more details can be found on each course.`);
        section2.appendChild(section2Title);
        section2.appendChild(section2Text);
        article.appendChild(section2);

        const section3 = document.createElement('section');
        const section3Title = li.createElemWithText('h3',"Style editor");
        const section3Text = document.createTextNode(`In the footer of each page a style editor has been added. 
            You can select what html element you want to through the top dropdown menu. After choosing a element 
            to edit you can change the fon size into any valid css font size and the text of the selected element will change accordinglly. 
            For the font color a color picker has been added to modify the colors. A font type selector was also added to allow the changing of fonts.`);
        section3.appendChild(section3Title);
        section3.appendChild(section3Text);
        article.appendChild(section3);
    }
}

document.onload = init();

function init() {
    let indexPage = new IndexPage();
    indexPage.init();
}

