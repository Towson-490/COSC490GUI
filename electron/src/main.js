let { ipcRenderer } = require('electron');

// Host for queries
let url = "http://127.0.0.1:5000";
// Count to keep test names unique
let count = 0;
// To store clicked test element to run
let clicked = null;
let initiated = false;
// To store routes when received by addTestWindow
let testRoutes = {};

// Function for XMLHttpRequests
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

// Create addTestWindow on create test click
function callAddWindow(){
    // Create data object to send with ipcRenderer to app.js
    var data ={};
    // Get url from websiteURL
    var url = document.getElementById("url").value;
    data.url = url;
    console.log(data);

    // Send data to ipcMain for addTestWindow
    ipcRenderer.send('add-window', data);
}

// Add test element to mainWindow on add test click from addTestWindow
ipcRenderer.on('add-test', function (e, data) {
    // Get tests div to append test
    const allTests = document.getElementById('tests');

    // Create div for test 
    n = count++
    const testDiv = document.createElement('div');
    label = data.label + n;
    testDiv.id = (label).replace(/\s+/g, '');
    testDiv.className = "testChoice";
    const h = document.createElement('h3');
    h.innerText = label;
    testDiv.appendChild(h);
    // Add list to testRoutes object for test
    testRoutes[label]=[]

    // Get tests and add to test div
    // Add routes to testRoutes list for test
    for (const box in data.boxes){
        console.log(box +": "+data.boxes[box])
        const test = document.createElement('li');
        test.appendChild(document.createTextNode(box))
        testDiv.appendChild(test);
        testRoutes[label].push(data.boxes[box])
    }

    // Select and assign/reassign clicked test
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

// Make queries on start click
async function callTests(){
    if(clicked){
        let result = "";
        if(!initiated){            
            // Initialize driver
            console.log("Initializing Driver");
            result = await http('/init?headless=False');

            // Set initiated to true to not double run tests
            if (result.result === "success"){
                initiated = true
            }
            console.log(result);
            var get = "/get"
            get += "?url=" + document.getElementById("url").value
            console.log("Getting WebPage: " + get);
            result = await http(get);
            console.log(result);

            // Get and run routes from testRoutes object based on test id
            var routes = testRoutes[clicked.id];
            for (const route of routes) {
                console.log("Running Test for /" + route);
                result = await http('/' + route);
                alert("Data Found:\n" + result.data +
                    "\n\nResult:\n" + result.result +
                    "\n\nDescription:\n" + result.desc
                );
            }
            // Terminate Driver
            console.log("Ending Test");
            result = await http('/quit');
            console.log(result);
            initiated = false;
            alert("Testing Finished & Processes Stopped")
        }
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