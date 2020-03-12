console.log('main process working');

const { app, BrowserWindow } = require('electron');
const  path = require("path");
const  url = require("url");
 
/**Resource path:: Uncomment after testing  */
//var pathF = path.resolve(process.resourcesPath, './py/dist/api/api.exe'); //<---Executable python server path

/**Testing path:: Comment out after testing */
//var pathF = path.resolve('./py/dist/api/api.exe');

var subproc = null;

//app urlloc
//var appurl = 'http://localhost:5000/';

let win2;

function  createWindow() {


    win2 = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    
    win2.loadURL(url.format({
        pathname: path.join(__dirname, 'gui.html'),
        protocol: 'file',
        slashes: true,
    }));

    // win2.loadURL(appurl);


    win2.on("closed", () =>{
        win2 = null;
        //close the open server
        if(subproc != null){
            subproc.kill('SIGINT');
        }
    });

}

app.on('ready', function () {
    createWindow()
    //prom();
})

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

