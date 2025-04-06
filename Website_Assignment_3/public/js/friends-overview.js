import * as lib from './lib.js'

// Load header nav and footer from lib.
lib.makeHeader('Your Friends Overview');
lib.makeFooter();

const friends = document.getElementsByClassName('friends-list__friend');

for (const friend of friends) {
    const friendID = friend.getAttribute('data-userID');
    const photo = friend.getElementsByClassName('friends-list__friend__photo')[0];
    
    // Get the photo from the server.
    const reqPhoto = new XMLHttpRequest();
    reqPhoto.responseType = 'blob';
    reqPhoto.onload = () => {
        const blob = reqPhoto.response;

        if (blob.size > 0) {
            const photoURL = URL.createObjectURL(blob);
            photo.src = photoURL;
        } else {
            photo.src = 'images/image_not_found.jpg';
        }
    }
    reqPhoto.open('GET', `student-photo/${friendID}`);
    reqPhoto.send();

    const buttons = friend.getElementsByClassName("friends-list__friend__buttons")[0];

    // Redirect to friends profile page button.
    const openProfileButton = buttons.children[0];
    openProfileButton.addEventListener('click', () => {
        location.href = `profile-view/${friendID}`;
    });

    // Redirect to friends chat button.
    const openChatButton = buttons.children[1];
    openChatButton.addEventListener('click', () => {
        location.href = `chat/${friendID}`;
    });
}