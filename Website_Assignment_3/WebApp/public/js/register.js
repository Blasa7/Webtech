
const body = document.querySelector('body');

generateForm(body);

function generateForm(node) {
    const form = document.createElement('form');
    node.appendChild(form);
    form.setAttribute('action','/register');
    form.setAttribute('method','post');

    const par1 = document.createElement('p');
    form.appendChild(par1);
    const par2 = document.createElement('p');
    form.appendChild(par2);
    const par3 = document.createElement('p');
    form.appendChild(par3)

    const label1 = document.createElement('label');
    const input1 = document.createElement('input');
    par1.appendChild(label1);
    par1.appendChild(input1);
    const label2 = document.createElement('label');
    const input2 = document.createElement('input');
    par2.appendChild(label2);
    par2.appendChild(input2);
    const button = document.createElement('button');
    const text = document.createTextNode('register');
    button.appendChild(text);
    par3.appendChild(button);

    label1.setAttribute('for','username');
    input1.setAttribute('id','username');
    input1.setAttribute('type','text');
    input1.setAttribute('required','true');
    input1.setAttribute('name','username');
    label2.setAttribute('for','password');
    input2.setAttribute('id','password');
    input2.setAttribute('type','password');
    input2.setAttribute('name','password');
    input2.setAttribute('required','true');
    par3.setAttribute('class','button');
    button.setAttribute('value','register');
    button.setAttribute('type','submit');

    label1.appendChild(document.createTextNode('username:'));
    label2.appendChild(document.createTextNode('password:'));

    const link = document.createElement('a');
    link.setAttribute('href','/login.html')
    const linkText = document.createTextNode('login');
    link.appendChild(linkText);
    form.appendChild(link);
}
