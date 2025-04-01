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
                    img.src = student.photo;
                    
                    // Get the photo from the server.
                    const reqPhoto = new XMLHttpRequest();
                    reqPhoto.responseType = 'blob';
                    reqPhoto.onload = () => {
                        const blob = reqPhoto.response;
                    
                        if (blob) {
                            const photoURL = URL.createObjectURL(blob);
                            img.src = photoURL;
                        } else {
                            img.src = 'image/image_not_found.jpg';
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
                }
            };
            req.open('GET', `/course-student-list/${courseSection.getAttribute('data-courseID')}`);
            req.send();
        } else {
            studentOverview.replaceChildren();
        }
    });
}
