const url = "http://127.0.0.1:5000"
function http(end) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
        }
    };
    xhttp.open("GET", url+end, true);
    xhttp.send();
}
