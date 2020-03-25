var { ipcRenderer } = require('electron');

var url = "http://127.0.0.1:5000";
var count = 0;
function http(end) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }
    };
    xhttp.open("GET", url + end, true);
    xhttp.send();
}

function callAddWindow(){
    ipcRenderer.send('add-window');
}

ipcRenderer.on('add-test', function (e, data) {
    const allTests = document.getElementById('tests');
    const testDiv = document.createElement('div');
    testDiv.id = ("for " + data.label + count++).replace(/\s+/g, '');
    testDiv.className = "testChoice";
    const h = document.createElement('h3');
    h.innerText = data.label;
    testDiv.appendChild(h);
    data.boxes.forEach(test => {
        const testText = document.createTextNode(test + " ");
        testDiv.appendChild(testText);
    });
    testDiv.addEventListener('click', function(){
        if(testDiv.className == "testChoice"){
            testDiv.className = "clicked";
        }else{
            testDiv.className = "testChoice";
        }
    });
    allTests.appendChild(testDiv);
});