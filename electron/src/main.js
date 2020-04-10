let { ipcRenderer } = require('electron');

let url = "http://127.0.0.1:5000";
let count = 0;
let clicked = null;
let initiated = false;

 function http(end) {
    return new Promise(resolve => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                resolve(JSON.parse(this.responseText))
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
        if(testDiv.className === "testChoice"){
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
        let result = "";
        if(!initiated){
            console.log("Initializing Driver");
            result = await http('/init?headless=True');
            if (result.result === "success"){
                initiated = true
            }
            console.log(result);
            console.log("Getting WebPage");
            result = await http('/get');
            console.log(result);
        }

        const tests = [];
        for(let i = 0; i < clicked.childNodes.length; i ++ ){
            const node = clicked.childNodes[i];
            if(node.nodeName === "#text"){
                test = node.data.trim();
                tests.push(test);
                console.log("Running Test for " + test);
                result = await http('/' + test)
                alert("Data Found:\n" + result.data + "\n\nResult:\n" + result.result + "\n\nDescription:\n" + result.desc);
            }
        }

        console.log("Ending Test");
        result = await http('/quit');
        console.log(result);
        alert("Testing Finished & Processes Stopped")
    }else{
        alert("Must pick test to run");
    }
}

function clearTests(){
    const allTests = document.getElementById('tests');
    allTests.innerHTML = "";
    count = 0
}

function stopTests(){
    http('/quit');
    initiated = false;
}