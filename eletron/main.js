console.log('main process working');

const  electron = require("electron");
const  app = electron.app;
const BrowserWindow  = electron.BrowserWindow;
const  path = require("path");
const  url = require("url");

let win2;

function  createWindow() {

    win2 = new  BrowserWindow();

    win2.loadURL(url.format({
        pathname: path.join(__dirname, 'gui.html'),
        protocol: 'file',
        slashes: true
    }));

    win2.on("closed", () =>{
        win2 = null;
    });


    win2.on('closed', () =>{
        win2 = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});

app.on("activate", () =>{
    if (win2 === null){
        createWindow()
    }
});
