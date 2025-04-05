import * as lib from './lib.js'

// Load header nav and footer from lib.
lib.makeHeader('Student Profile View');
lib.makeFooter();

const userId = document.getElementById('student-profile').getAttribute('data-userID');
const photo = document.getElementById('profile-photo');

// Get the photo from the server.
const reqPhoto = new XMLHttpRequest();
reqPhoto.responseType = 'blob';
reqPhoto.onload = () => {
    const blob = reqPhoto.response;

    if (blob.size > 0) {
        const photoURL = URL.createObjectURL(blob);
        photo.src = photoURL;
    } else {
        photo.src = '../images/image_not_found.jpg';
    }
}
reqPhoto.open('GET', `../student-photo/${userId}`);
reqPhoto.send();