import * as lib from './lib.js'

// Load header nav and footer from lib.
lib.makeHeader('Your Course Overview');
lib.makeFooter();

const courseSections = document.getElementsByClassName('course-section');

for (const courseSection of courseSections) {
    courseSection.addEventListener('click', () => {
        const active = courseSection.classList.toggle('active');
        const studentOverview = courseSection.getElementsByClassName('collapsible-student-overview')[0];

        if (active) {
            // Fetch list of students with AJAX request.
            const req = new XMLHttpRequest();
            req.onload = () => {
                const students = JSON.parse(req.responseText);

                // Generate elements for each student.
                for (const student of students) {
                    const studentItem = document.createElement('li');
                    studentItem.className = 'collapsible-student-overview__student';
                    studentOverview.appendChild(studentItem);

                    const img = document.createElement('img');
                    img.className = 'collapsible-student-overview__photo';
                    
                    // Get the photo from the server.
                    const reqPhoto = new XMLHttpRequest();
                    reqPhoto.responseType = 'blob';
                    reqPhoto.onload = () => {
                        const blob = reqPhoto.response;
                        
                        if (blob.size > 0) {
                            const photoURL = URL.createObjectURL(blob);
                            img.src = photoURL;
                        } else {
                            img.src = 'images/image_not_found.jpg';
                        }
                    }
                    reqPhoto.open('GET', `student-photo/${student.user_id}`);
                    reqPhoto.send();

                    studentItem.appendChild(img);

                    const name = document.createElement('h3');
                    name.className = 'collapsible-student-overview__name';
                    studentItem.appendChild(name);

                    const nameText = document.createTextNode(student.name);
                    name.appendChild(nameText);


                    // Send friend request button.
                    const friendStatus = document.createElement('button');
                    friendStatus.className = 'collapsible-student-overview__friend-status';
                    friendStatus.setAttribute('data-friendStatus', '');
                    //friendStatus.src = `friend-status-icon/${student.user_id}`; //'images/send_friend_request.png';
                    studentItem.appendChild(friendStatus);

                    const friendStatusText = document.createTextNode('');
                    friendStatus.appendChild(friendStatusText);

                    const reqStatus = new XMLHttpRequest();
                    reqStatus.onload = () => {
                        const status = reqStatus.responseText;
                        friendStatusText.data = friendStatusToText(status);
                        friendStatus.setAttribute('data-friendStatus', status);
                    };
                    reqStatus.open('GET', `friend-status/${student.user_id}`);
                    reqStatus.send();


                    friendStatus.addEventListener('click', () => {
                        const reqFriend = new XMLHttpRequest();
                        reqFriend.onload = () => {
                            const status = reqFriend.responseText;
                            friendStatusText.data = friendStatusToText(status);
                            friendStatus.setAttribute('data-friendStatus', status);
                        }
                        if (friendStatus.getAttribute('data-friendStatus') == 'PENDING'){
                            // Cancel request.
                            reqFriend.open('POST', `cancel-friend-request/${student.user_id}`);
                        } else {
                            // Make request.
                            reqFriend.open('POST', `send-friend-request/${student.user_id}`);
                        }
                        reqFriend.send();
                    });

                }
            };
            req.open('GET', `/course-student-list/${courseSection.getAttribute('data-courseID')}`);
            req.send();
        } else {
            studentOverview.replaceChildren();
        }
    });

    const studentOverview = courseSection.getElementsByClassName('collapsible-student-overview')[0];
    studentOverview.addEventListener('click', (event) => {
        // Stop foldout from collapsing when clicking on a student.
        event.stopPropagation();
    });
}

function friendStatusToText(status){
    switch (status){
        case 'NONE':
            return 'Send Friend Request';
        case 'INCOMING':
            return 'Accept Friend Request';
        case 'PENDING':
            return 'Cancel Friend Request';
        case 'ACCEPTED':
            return 'Accepted Friend Request';
        default:
            return '';
    }
}
