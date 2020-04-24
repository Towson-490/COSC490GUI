const { ipcRenderer } = require('electron');

ipcRenderer.on('close-addTestWindow', (e) => {
    replaceAlert("warning", "Cancelled add test")
    setTimeout(closeAlert, 1000);
});

// Add test element to mainWindow on add test click from addTestWindow
ipcRenderer.on('add-test', function (e, data) {
    replaceAlert("success", "Added test");
    setTimeout(closeAlert, 1000);
    // Get tests div to append test
    let allTests = document.getElementById('tests');

    // Create div for test 
    let n = ++count
    let label = data.label;
    const testRow = document.createElement('tr');
    testRow.id = `${label}-${n}`;
    testRow.className = "testChoice";

    const rowHead = document.createElement('th');
    rowHead.scope = "row";
    rowHead.appendChild(document.createTextNode(n));
    testRow.appendChild(rowHead);

    let rowData = document.createElement('td');
    rowData.appendChild(document.createTextNode(label))
    testRow.appendChild(rowData);

    rowData = document.createElement('td');

    // Add list to testRoutes object for test
    testRoutes[testRow.id] = data.boxes;

    // Get tests and add to test row
    // Add routes to testRoutes to cell for test
    for (let box in data.boxes) {
        rowData.appendChild(document.createTextNode(box));
        rowData.appendChild(document.createElement("br"));
        //testRoutes[label].push(data.boxes[box]);
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

// Host for queries
const url = "http://127.0.0.1:5000";
// Count to keep test names unique
let count = 0;
// To store clicked test element to run
let clicked = null;
let initiated = false;
// To store routes when received by addTestWindow
let testRoutes = {};

// Create generalized alert element
const actionAlert = (type, message) => {
    var div = document.createElement('div');
    div.className = "alert show fade alert-" + type;
    div.role = "alert";
    var text = document.createTextNode(message);
    div.appendChild(text);
    return div;
}

const appendInfoAlert = (attr, value, message) => {
    let find = (attr == 'id' ? "#" : ".") + value;
    $(find).append(actionAlert("info", message));
}
const replaceAlert = (type, message) => {
    $('.alert').replaceWith(actionAlert(type, message));
}
const closeAlert = () => {
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
    appendInfoAlert("id", "test-alerts", "Creating test...");

    // Create data object to send with ipcRenderer to app.js
    let data = {};
    // Get url from websiteURL
    let url = document.getElementById("url").value;
    data.url = url;
    console.log(data);

    // Send data to ipcMain for addTestWindow
    ipcRenderer.send('add-window', data);
}

const updateProgress = (width) => {
    $('#progress-bar').css('width', width + '%');
    $('#progress-bar').text(width + "%");
}

// Make queries on start click
async function callTests() {
    if (clicked) {
        $("#modal-btn").prop("hidden", true);
        $(".modal-body").empty();
        $('.modal-title').text("Test Results: " + clicked.id);
        let result = "";
        let currentProgress = 0;

        if (!initiated) {
            $(".modal-body").append(`<h5>Setup</h5><hr>`);
            $(".modal-body").append("<dl id='modal-dl-setup'></dl>");
            $("#modal-dl-setup").append(`<dt>Headless Mode:</dt><dd>${$("#headless").prop("checked")}</dd>`);

            // Initialize driver
            appendInfoAlert("id", "log-alerts", "Initializing Driver...");
            let init = "/init"
            if (document.getElementById("headless").checked) {
                init += "?headless=True"
            }

            result = await http(init);
            $("#modal-dl-setup").append(`<dt>Initialize Driver:</dt><dd>${result.status}</p></dd>`);

            // Set initiated to true to not double run tests
            if (result.status === "success") {
                replaceAlert("success", "Driver initialized");
                updateProgress(currentProgress += 5);

                initiated = true;
                let get = "/get";
                let url = document.getElementById("url").value

                get += "?url=" + url
                replaceAlert("info", `Contacting Website: ${url}...`);
                result = await http(get);

                $("#modal-dl-setup").append(`<dt>Contacting Website:</dt><dd>${result.status}</dd>`);
                if (result.status === "success") {
                    replaceAlert("success", "Website contacted: " + url + "...");
                    updateProgress(currentProgress += 5);

                    // Get and run routes from testRoutes object based on test id
                    let routes = testRoutes[clicked.id];
                    console.log(routes);
                    let percentChange = 90 / Object.keys(routes).length;

                    $(".modal-body").append(`<h5>Testing</h5><hr>`);
                    for (const route in routes) {
                        replaceAlert("info", "Running Test For " + route);
                        result = await http('/' + routes[route]);

                        $(".modal-body").append("<div id='modal-testing-container' class='container'></div>")
                        $("#modal-testing-container").append("<dl id='modal-dl-testing'></dl>");
                        $("#modal-dl-testing").append(`<dt>Test: ${route}</dt><dd>${result.status}</dd>`);
                        if(result.status === "success"){
                            $("#modal-dl-testing").append(`<dt>Data Found:</dt><dd>${result.data}</dd>`);
                            $("#modal-dl-testing").append(`<dt>Pass/Fail:</dt><dd>${result.result}</dd>`);
                            $("#modal-dl-testing").append(`<dt>Description:</dt><dd>${result.desc}</dd>`);
                        }
                        $("#modal-dl-testing").append("<hr>");
                        updateProgress(currentProgress += percentChange);
                    }
                    // Terminate Driver
                    replaceAlert("info", "Stopping Driver...");

                    $(".modal-body").append(`<h5>Teardown</h5><hr>`);
                    $(".modal-body").append("<dl id='modal-dl-teardown'></dl>");

                    result = await http('/quit');

                    $("#modal-dl-teardown").append(`<dt>Driver stopped:</dt><dd>${result.status}</dd>`);
                    if(result.status === "success"){
                        initiated = false;

                        replaceAlert("success", "Driver stopped");
                        replaceAlert("success", "Testing Finished & Processes Stopped");
                        setTimeout(closeAlert, 1000);
                        updateProgress(0);
                    }else{
                        replaceAlert("danger", "Driver failed to stop");
                    }
                } else {
                    replaceAlert("danger", "Failed to contact Website");
                }
            } else {
                replaceAlert("danger", "Failed to initiate driver");
            }
        } else {
            console.log("driver already initiated");
            replaceAlert("danger", "Driver already initiated");
        }
        $("#modal-btn").prop("hidden", false);
    } else {
        $('.modal-title').text("No test chosen");
        $('.modal-body').text("Choose test from list to start");
        $("#modal-save").prop("hidden", true);
        $('#modal').modal();
    }
}

function clearTests() {
    let allTests = document.getElementById('tests');
    allTests.innerHTML = "";
    count = 0
}

function stopTests() {
    http('/quit');
    initiated = false;
}