var { ipcRenderer } = require('electron');

var url = "http://127.0.0.1:5000";
var count = 0;
var clicked = null
initiated = false
 function http(end) {
    return new Promise(resolve => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve(this.responseText);
            }
        };
        xhttp.open("GET", url + end, true);
        xhttp.send();
    });
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
            if(clicked){
                clicked.className = "testChoice";
            }
            testDiv.className = "clicked";
            clicked = testDiv;
        }else{
            testDiv.className = "testChoice";
        }
    });
    allTests.appendChild(testDiv);
});

async function callTests(){
    if(clicked){
        var result = "";
        if(!initiated){
            result = await http('/init');
            console.log(result);
            result
        }
        
        var tests = []
        for(var i = 0; i < clicked.childNodes.length; i ++ ){
            var node = clicked.childNodes[i];
            if(node.nodeName == "#text"){
                tests.push(node.data.trim());
                result = await http('/' + node.data.trim())
            }
        }
    }else{
        alert("Must pick test to run");
    }
}