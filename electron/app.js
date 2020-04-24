console.log('main process working');

require('electron-reload')(__dirname);
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

/**Resource path:: Uncomment after testing  */
//var pathF = path.resolve(process.resourcesPath, './py/dist/api/api.exe'); //<---Executable python server path

/**Testing path:: Comment out after testing */
//var pathF = path.resolve('./py/dist/api/api.exe');

var subproc = null;

//app urlloc
//var appurl = 'http://localhost:5000/';

let mainWindow;
let addTestWindow;

//Listen for app to be ready
app.on('ready', function () {
    //create new window
    createMainWindow();
    //prom();

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

function createMainWindow() {
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 850,
        height: 620,
    });

    // Load html file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/main.html'),
        protocol: 'file',
        slashes: true,
    }));

    // entry.loadURL(appurl);

    // Quit app when closed
    mainWindow.on('closed', () => {
        mainWindow = null;

        // Close the open server
        if (subproc != null) {
            subproc.kill('SIGINT');
        }

        app.quit();
    });
}

let testAdded = false;

ipcMain.on('add-test', function (e, data) {
    testAdded = true;
    mainWindow.webContents.send('add-test', data);
    addTestWindow.close();
    testAdded = false;
});

ipcMain.on('add-window', (e, data) => {
    createAddWindow(data);
});

// Handle create add window
function createAddWindow(data) {
    // Create new window
    addTestWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        parent: mainWindow,
        modal: false,
        frame: true,
        width: 350,
        height: 600,
        title: 'Add Test'
    });

    // Load html file into window
    addTestWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/addTest.html'),
        protocol: 'file',
        slashes: true,
    }));

    // Send data to addTestWindow from mainWindow
    addTestWindow.webContents.on('did-finish-load', () => {
        addTestWindow.webContents.send('add-data', data);
    });

    // Quit window when closed
    addTestWindow.on('closed', () => {
        addTestWindow = null;
    });
    addTestWindow.on('close', () => {
        if(!testAdded){
            mainWindow.webContents.send('close-addTestWindow');
        }
    })
}


const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Test',
                click() {
                    createAddWindow();
                },
            },
            {
                label: 'Clear Tests'
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu
if (process.platform == 'darwin') {
    // array method adds to beginning to array
    mainMenuTemplate.unshift({label: ''});
}

// Add developer tools if not in production
if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer-Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}

// function prom() {
//     //wait until the url started
//     subproc = require('child_process').exec(pathF)
//     if(subproc!= null){
//         console.log("server success")
//         createWindow();
//     }else{
//         console.log("fail")
//     }

// }