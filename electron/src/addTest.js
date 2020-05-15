const { ipcRenderer } = require('electron');
let tests = require("./scripts/tests.json")

// If local storage is available, and tests is not stored, store for persistence
if (typeof(Storage) !== "undefined") {
  if (!localStorage.getItem("tests")){
    localStorage.setItem("tests", JSON.stringify(tests))
  }else{
    tests = JSON.parse(localStorage.getItem("tests"))
    console.log(tests)
  }
} else {
  // No web storage Support.
}


let addData = {};
// Get data from main window
ipcRenderer.on('add-data', function (e, data) {
  addData = data;
  console.log(data);
});

function getEntries(o) {
  if (o) {
    return `<footer class="blockquote-footer">Values:
      ${Object.entries(o).map(e => { return ` [${e[0]}: ${e[1]}]` })}
    </footer>`
  }
}
$(window).on("load", () => {
  n = 1
  tests.forEach((test, index)=>{
    let addParams = test["values"]
    $("#testList").append(`
  <div class="form-check" id=testDiv>
    <input id=${test["routeSlug"]} class="form-check-input test" type="checkbox" name="test" value="${test["routeSlug"]}">
    <label class="form-check-label" for="test">${test["routeDesc"]}</label>
    <span>${(addParams ? `<button id="edit-test${n}-values" type="button" class="btn btn-link btn-link" data-toggle="modal" data-target="#editModal"
        data-whatever="@getbootstrap">Edit Values</button>` : "")}</span>
  </div>
  <blockquote class="blockquote">
    <footer class="blockquote-footer">${test["desc"]}</footer>
    ${(addParams ? getEntries(test["values"]) : "")}
  </blockquote>
  `);

    $(`#edit-test${n++}-values`).on("click", () => {
      $("#editModalLabel").text(`Edit Values: ${test.routeDesc}`)
      $("#modal-form").empty()
      for (v in test.values) {
        console.log(v)
        $("#modal-form").append(
          `
          <p>${v}</p>
          <input class="form-control"
            id=${v}
            name=${index} 
            type="${typeof (test.values[v])}"
            ${typeof (test.values[v]) == "number" ? "min=0" : ""} 
            value=${test.values[v]}>
          <hr>
          `
        )
      }
    });


    if (addParams) {
      let $routeSlug = $(`#${test["routeSlug"]}`)
      $routeSlug.val($routeSlug.val() + "?values=true")
      Object.entries(addParams).forEach(([key, value]) => {
        console.log(`test: ${test["routeDesc"]} &${key}=${value}`)
        $routeSlug.val((i, val) => {
          return val + `&${key}=${value}`
        })
      })
    }
  })
});

function updateValues(e) {
  $("#modal-form :input").each(function(){
    tests[$(this).prop("name")]["values"][$(this).prop("id")] = parseInt($(this).val())
    localStorage.setItem("tests", JSON.stringify(tests))
    location.reload();
    //return false;
  })
  
  
}

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
      for (box of checkedBoxes) {
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