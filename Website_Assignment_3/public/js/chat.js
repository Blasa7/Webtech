import * as lib from './lib.js'

// Load header nav and footer from lib.
lib.makeHeader('Student Profile View');
lib.makeFooter('../');

const messageInputSection = document.getElementsByClassName('message-input-section')[0];
const fromUserID = messageInputSection.getAttribute('data-fromID');
const toUserID = messageInputSection.getAttribute('data-toID');

const messageInputText = messageInputSection.getElementsByClassName('message-input-section__text-input')[0];
const messageInputButton = messageInputSection.getElementsByClassName('message-input-section__send-button')[0];

// Send the message.
messageInputButton.addEventListener('click', () => {
    const messageText = messageInputText.value;

    // Dont send empty strings.
    if (messageText){
        const req = new XMLHttpRequest();
        req.onload = () => {
            location.reload();
        };
        req.open('POST', `../send-message/${toUserID}`);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify({text: messageText}));
    }
});