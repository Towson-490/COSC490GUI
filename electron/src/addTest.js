const { ipcRenderer } = require('electron');

let addData = {};

// Get data from main window
ipcRenderer.on('add-data', function (e, data) {
  addData = data;
  console.log(data);
});

let tests = [
  {
    "routeDesc": "Number of page fonts",
    "routeSlug": "get_fonts",
    "desc": "Test consistency",
    "values": {
      "acceptable": 6,
    },
  },
  {
    "routeDesc": "Check page text",
    "routeSlug": "get_nogo_text/text",
    "desc": "Test terms to avoid"
  },
  {
    "routeDesc": "Number of text colors",
    "routeSlug": "get_text_colors",
    "desc": "Test consistency",
    "values": {
      "acceptable": 6,
    },
  },
  {
    "routeDesc": "Number of background colors",
    "routeSlug": "get_background_colors",
    "desc": "Test consistency",
    "values": {
      "acceptable": 6,
    },
  },
  {
    "routeDesc": "Check background colors",
    "routeSlug": "get_nogo_colors/background",
    "desc": "Test colors to avoid"
  },
  {
    "routeDesc": "Get average response times",
    "routeSlug": "get_avg_response",
    "desc": "Test time (ms) between domain links",
    "values": {
      "acceptable": 10000,
      "backend": 5000,
      "frontend": 5000
    },
  },
  
];

function getEntries(o) {
  if (o) {
    return `<footer class="blockquote-footer">Defaults:
      ${Object.entries(o).map(e => { return ` [${e[0]}: ${e[1]}]` })}
    </footer>`
  }
}
$(window).on("load", () => {
  for (let test of tests) {
    let addParams = test["values"]
    $("#testList").append(`
  <div class="form-check" id=testDiv>
    <input id=${test["routeSlug"]} class="form-check-input test" type="checkbox" name="test" value="${test["routeSlug"]}">
    <label class="form-check-label" for="test">${test["routeDesc"]}</label>
    <span>${(addParams ? `<button id="edit-value-modal" type="button" class="btn btn-link btn-link" data-toggle="modal" data-target="#editModal"
        data-whatever="@getbootstrap">${"Edit values"}</button>` : "")}</span>
  </div>
  <blockquote class="blockquote">
    <footer class="blockquote-footer">${test["desc"]}</footer>
    ${(addParams ? getEntries(test["values"]) : "")}
  </blockquote>
  `);
    if (addParams) {    
      let $routeSlug = $(`#${test["routeSlug"]}`) 
      $routeSlug.val($routeSlug.val()+"?values=true")
      Object.entries(addParams).forEach(([key, value]) => { 
        console.log(`&${key}=${value}`)
        $routeSlug.val((i, val) => {
          return val + `&${key}=${value}`
        }) 
      })
    }
  }
});

// Handle submit button
function getCheckedBoxes(e) {
  e.preventDefault();
  const data = {};
  let label = $("#test-label").prop("value").trim();
  if (label != "") {
    data.label = label;
    let checkedBoxes = $(".test:checked")

    if (checkedBoxes.length != 0) {
      let boxes = {}
      for (box of checkedBoxes){
        boxes[box.nextElementSibling.innerText] = box.value;
      }
      data.boxes = boxes;
      console.log(data);
      ipcRenderer.send('add-test', data);
    } else {
      console.log("Please select test(s)")
      $("#add-group-alerts").append(actionAlert("add-group-alert", "danger", "Must select test(s)"));
      closeAlert("add-group-alert", 1000);
    }
  } else {
    $("#add-group-alerts").append(actionAlert("add-group-alert", "danger", "Must enter group label"));
    closeAlert("add-group-alert", 1000);
  }
}

$("#all").on('click', () => {
  $(".test").prop("checked", $("#all").prop("checked")); ``
});