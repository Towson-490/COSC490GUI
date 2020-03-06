// This dco holds all of the js code for the app.
//This be refactor later during the project

// this methods adds website that testing it being affected m

function getText(str1) {
    const adasd = document.getElementById(str1).value;
    return adasd;
}
//this is adding the websites the will be going through
function addChild() {
    var parent = document.getElementById('website');
    let Hello = 'Helloasdasdasd';
    const newChild = '<p> Website ' + Hello + '</p>';
    parent.insertAdjacentHTML('beforeend', newChild);
}

function myFunction() {
    var txt;
    var person = prompt("Please enter your name:", "Harry Potter");
    if (person == null || person == "") {
        txt = "User cancelled the prompt.";
    } else {
        txt = "Hello " + person + "! How are you today?";
    }
    document.getElementById("demo").innerHTML = txt;
}