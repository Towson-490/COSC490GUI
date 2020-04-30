const { ipcRenderer } = require('electron');
// Load config.json
const config = require('../config.json')

// Get environment, set as development by default
const environment = process.env.NODE_ENV || 'development';
// Set global config based on environment
const gConfig = config[environment]
// Set host for queries based on global config
const url = gConfig.api_host+":"+gConfig.api_port;

// Count to keep test names unique
let count = 0;

// Store clicked test element to run
let selectedTest = null;
let initiated = false;

// To store routes when received by addTestWindow
let testRoutes = {};

// Create addTestWindow on create test click
function callAddWindow() {
    // Get div #content to alert user
    $("#test-alerts").append(actionAlert("new-group-alert", "info", "Creating test group..."));

    // Create data object to send with ipcRenderer to app.js
    let data = {};
    console.log(data);

    // Send data to ipcMain for addTestWindow
    ipcRenderer.send('add-window', data);
}

ipcRenderer.on('close-addTestWindow', (e) => {
    replaceAlert("new-group-alert", "warning", "Cancelled add test");
    closeAlert("new-group-alert", 1000);
});

// Add test element to mainWindow on add test click from addTestWindow
ipcRenderer.on('add-test', function (e, data) {
    // Get tests div to append test
    let allTests = document.getElementById('tests');

    // Create table row for test 
    let n = ++count
    let label = data.label;
    const testRow = document.createElement('tr');
    testRow.id = `${label}-${n}`;
    testRow.className = "testChoice";

    // Add n as row head
    const rowHead = document.createElement('th');
    rowHead.scope = "row";
    rowHead.appendChild(document.createTextNode(n));
    testRow.appendChild(rowHead);

    // Add label to row
    let rowData = document.createElement('td');
    rowData.appendChild(document.createTextNode(label))
    testRow.appendChild(rowData);

    // Add Tests to row
    rowData = document.createElement('td');
    // Add test list to testRoutes object for test
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
            if (selectedTest) {
                selectedTest.className = "testChoice";
            }
            testRow.className = "table-primary clicked";
            selectedTest = testRow;
        } else {
            testRow.className = "testChoice";
        }
    });
    allTests.appendChild(testRow);

    // Add actions to row
    $(`<td><a id="delete-${label}-${n}" href="#" class="badge badge-danger"><svg class="bi bi-trash" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
    <path fill-rule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" clip-rule="evenodd"/>
    </svg> Remove</a>
    </td>`).appendTo(`#${label}-${n}`);
    $(`#delete-${label}-${n}`).on("click", (e)=> {
        e.stopPropagation();
        $(`#${label}-${n}`).remove();
        if($("#tests").children().length == 0){
            count = 0;
        }
    })

    replaceAlert("new-group-alert", "success", "Added test");
    closeAlert("new-group-alert", 1000);
});

const updateProgress = (width) => {
    $('#progress-bar').css('width', width + '%');
    $('#progress-bar').text(width + "%");
};

// Make queries on start click
async function callTests() {
    if (selectedTest) {
        $("#modal-btn").prop("disabled", true);
        $(".modal-body").empty();
        $('.modal-title').text("Test Results: " + selectedTest.id);
        let result = "";
        let currentProgress = 0;

        if (!initiated) {
            initiated = true;
            $(".modal-body").append(`<h5>Setup</h5><hr>`);
            $(".modal-body").append("<dl id='modal-dl-setup'></dl>");
            $("#modal-dl-setup").append(`<dt>Headless Mode:</dt><dd>${$("#headless").prop("checked")}</dd>`);

            // Initialize driver
            $("#log-alerts").append(actionAlert("log-alert", "info", "Initializing Driver..."));
            let init = "/init"
            if (document.getElementById("headless").checked) {
                init += "?headless=True"
            }
            result = await http(init);
            $("#modal-dl-setup").append(`<dt>Initialize Driver:</dt><dd>${result.status}</dd></dt>`);

            // Set initiated to true to not double run tests
            if (result.status === "success") {
                replaceAlert("log-alert", "success", "Driver initialized");
                updateProgress(currentProgress += 5);

                let get = "/get";
                let url = document.getElementById("url").value

                get += "?url=" + url
                replaceAlert("log-alert", "info", `Contacting Website: ${url}...`);
                result = await http(get);

                $("#modal-dl-setup").append(`<dt>Contacting Website:</dt><dd>${result.status}</dd>`);
                if (result.status === "success") {
                    replaceAlert("log-alert", "success", "Website contacted: " + url + "...");
                    updateProgress(currentProgress += 5);

                    // Get and run routes from testRoutes object based on test id
                    let routes = testRoutes[selectedTest.id];
                    console.log(routes);
                    let percentChange = 90 / Object.keys(routes).length;

                    $(".modal-body").append(`<h5>Testing</h5><hr>`);
                    for (const route in routes) {
                        replaceAlert("log-alert", "info", "Running Test For " + route);
                        result = await http('/' + routes[route]);

                        $(".modal-body").append("<div id='modal-testing-container' class='container'></div>")
                        $("#modal-testing-container").append("<dl id='modal-dl-testing'></dl>");
                        $("#modal-dl-testing").append(`<dt>Test: ${route}</dt><dd>${result.status}</dd>`);
                        if(result.status === "success"){
                            $("#modal-dl-testing").append(`<dt>Description:</dt><dd>${result.desc}</dd>`);
                            $("#modal-dl-testing").append(`<dt>Data Found:</dt><dd>${result.data}</dd>`);
                            $("#modal-dl-testing").append(`<dt>Pass/Fail:</dt><dd>${result.result}</dd>`);
                        }else {
                            $("#modal-dl-testing").append(`<dt>Code:</dt><dd>${result.code}</dd>`);
                            $("#modal-dl-testing").append(`<dt>Name:</dt><dd>${result.name}</dd>`);
                            $("#modal-dl-testing").append(`<dt>Description:</dt><dd>${result.description}</dd>`);
                            break;
                        }
                        $("#modal-dl-testing").append("<hr>");
                        updateProgress(currentProgress += percentChange);
                    }
                    // Terminate Driver
                    replaceAlert("log-alert", "info", "Stopping Driver...");

                    $(".modal-body").append(`<h5>Teardown</h5><hr>`);
                    $(".modal-body").append("<dl id='modal-dl-teardown'></dl>");

                    result = await http('/quit');

                    $("#modal-dl-teardown").append(`<dt>Driver stopped:</dt><dd>${result.status}</dd>`);
                    if(result.status === "success"){
                        initiated = false;

                        replaceAlert("log-alert", "success", "Driver stopped");
                        replaceAlert("log-alert", "success", "Testing Finished & Processes Stopped");
                        updateProgress(0);
                    }else{
                        replaceAlert("log-alert", "warning", "Driver did not stop right away");
                    }
                } else {
                    replaceAlert("log-alert", "danger", "Failed to contact Website");
                }
            } else {
                replaceAlert("log-alert", "danger", "Failed to initiate driver");
            }
            if(result.status === "error"){
                stopTests()
                initiated = false;
                $(".modal-body").append(`<h5>Error</h5><hr>`);
                $(".modal-body").append("<dl id='modal-dl-error'></dl>");
                $("#modal-dl-error").append(`<dt>Code:</dt><dd>${result.code}</dd>`);
                $("#modal-dl-error").append(`<dt>Name:</dt><dd>${result.name}</dd>`);
                $("#modal-dl-error").append(`<dt>Description:</dt><dd>${result.description}</dd>`);
            }
        } else {
            $("#test-alerts").append(actionAlert("new-group-alert", "warning", "Test Group Running..."));
            closeAlert("new-group-alert", 1000);
        }
        if(!initiated){
            closeAlert("log-alert", 1000);
            $("#modal-btn").prop("disabled", false);
        }        
    } else {
        $('.modal-title').text("No test chosen");
        $('.modal-body').text("Select group from the list to run");
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
    $(".alert").alert("close")
    $("#test-alerts").append(actionAlert("stop-test-alert", "danger", "Testing stopped"));
    closeAlert("stop-test-alert", 1000);
    updateProgress(0);
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