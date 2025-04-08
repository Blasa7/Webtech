
const body = document.querySelector('body');

generateForm(body);

function generateForm(node) {
    const form = document.createElement('form');
    node.appendChild(form);
    form.setAttribute('action','login');
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
    const text = document.createTextNode('Login');
    button.appendChild(text);
    par3.appendChild(button);

    label1.setAttribute('for','username');
    input1.setAttribute('id','username');
    input1.setAttribute('type','text');
    input1.setAttribute('name','username');
    input1.setAttribute('required','true');
    label2.setAttribute('for','password');
    input2.setAttribute('id','password');
    input2.setAttribute('type','password');
    input2.setAttribute('name','password');
    input2.setAttribute('required','true');
    button.setAttribute('value','login');
    button.setAttribute('type','submit');
    form.className = 'credentials-form';
    par1.className = 'credentials-p';
    par2.className = 'credentials-p';
    par3.className = 'credentials-p';
    body.className = 'credentials-body';
    

    label1.appendChild(document.createTextNode('Username:'));
    label2.appendChild(document.createTextNode('Password:'));

    const link = document.createElement('a');
    link.setAttribute('href','register.html')
    const linkText = document.createTextNode('Register');
    link.appendChild(linkText);
    form.appendChild(link);
}
