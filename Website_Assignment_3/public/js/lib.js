class Student {
    name;
    age;
    email;
    hobbies;
    photo;
    program;
    courses;

    constructor(name, age, email, hobbies, photo, program, courses) {
        this.name = name;
        this.age = age;
        this.email = email;
        this.hobbies = hobbies;
        this.photo = photo;
        this.program = program;
        this.courses = courses;
    }
}

class Program {
    title;
    description;

    constructor(title, description) {
        this.title = title;
        this.description = description;
    }
}

class Course {
    title;
    description;
    teacher;

    constructor(title, description, teacher) {
        this.title = title;
        this.description = description;
        this.teacher = teacher;
    }
}

export {Student, Program, Course}
