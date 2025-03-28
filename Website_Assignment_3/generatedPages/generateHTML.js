
import {JSDOM} from 'jsdom'; 
import {createProfilePage} from './profile.js';  

function initProfilePage(username) {
    // Create virtual DOM
    const dom = new JSDOM (`<!DOCTYPE html><html><head></head><body></body></html>`);
    const document = dom.window.document;
    createProfilePage(document, username);

    // Converts DOM to html string
    const html = dom.serialize();
    return html; // returns page 
}

export {initProfilePage};
