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

// Create generalized alert element
let actionAlert = (type, message) => {
    var div = document.createElement('div');
    div.className = "alert show fade alert-" + type;
    div.role = "alert";
    var text = document.createTextNode(message);
    div.appendChild(text);
    return div;
}

ipcRenderer.on('close-addTestWindow', (e) => {
    replaceAlert("warning", "Cancelled add test")

});
let replaceAlert = (type, message) => {
    $('.alert').replaceWith(actionAlert(type, message));
    setTimeout(closeAlert, 1000);
}
let closeAlert = () => {
    $('.alert').alert('close');
}

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
function callAddWindow() {
    // Get div #content to alert user
    $('#content').append(actionAlert("info", "Creating Test..."));

    // Create data object to send with ipcRenderer to app.js
    var data = {};
    // Get url from websiteURL
    var url = document.getElementById("url").value;
    data.url = url;
    console.log(data);

    // Send data to ipcMain for addTestWindow
    ipcRenderer.send('add-window', data);
}

// Add test element to mainWindow on add test click from addTestWindow
ipcRenderer.on('add-test', function (e, data) {
    replaceAlert("success", "Added test");
    // Get tests div to append test
    const allTests = document.getElementById('tests');

    // Create div for test 
    var n = ++count
    var label = data.label;
    const testRow = document.createElement('tr');
    testRow.id = (label).replace(/\s+/g, '');
    testRow.className = "testChoice";

    const rowHead = document.createElement('th');
    rowHead.scope = "row";
    rowHead.appendChild(document.createTextNode(n));
    testRow.appendChild(rowHead);

    var rowData = document.createElement('td');
    rowData.appendChild(document.createTextNode(label))
    testRow.appendChild(rowData);

    rowData = document.createElement('td');

    // Add list to testRoutes object for test
    testRoutes[label] = [];

    // Get tests and add to test row
    // Add routes to testRoutes to cell for test
    for (const box in data.boxes) {
        rowData.appendChild(document.createTextNode(box));
        rowData.appendChild(document.createElement("br"));
        testRoutes[label].push(data.boxes[box]);
    }
    testRow.appendChild(rowData);

    // Select and assign/reassign clicked test
    testRow.addEventListener('click', function () {
        if (testRow.className === "testChoice") {
            if (clicked) {
                clicked.className = "testChoice";
            }
            testRow.className = "table-primary clicked";
            clicked = testRow;
        } else {
            testRow.className = "testChoice";
        }
    });
    allTests.appendChild(testRow);
});

let updateProgress = (width) => {
    $('#progress-bar').css('width', width+'%');
    $('#progress-bar').text(width+"%");
}
// Make queries on start click
async function callTests() {
    if (clicked) {
        
        let result = "";
        var currentProgress = 0;
        if (!initiated) {
            // Initialize driver
            console.log("Initializing Driver");
            var init = "/init"
            if (document.getElementById("headless").checked) {
                init += "?headless=True"
            }
            result = await http(init);

            // Set initiated to true to not double run tests
            if (result.result === "success") {
                updateProgress(currentProgress += 5);
                initiated = true;
            }
            console.log(result);
            var get = "/get"
            get += "?url=" + document.getElementById("url").value
            console.log("Getting WebPage: " + get);
            result = await http(get);
            console.log(result);
            updateProgress(currentProgress += 5);

            // Get and run routes from testRoutes object based on test id
            var routes = testRoutes[clicked.id];
            var percentChange = 90 / routes.length;
            for (const route of routes) {
                console.log("Running Test for /" + route);
                result = await http('/' + route);
                updateProgress(currentProgress += percentChange);
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
            updateProgress(0);
        }
    } else {
        alert("Must pick test to run");
    }
}

function clearTests() {
    const allTests = document.getElementById('tests');
    allTests.innerHTML = "";
    count = 0
}

function stopTests() {
    http('/quit');
    initiated = false;
}