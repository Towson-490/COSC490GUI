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
];

function getEntries(o) {
  if (o) {
    return `<footer class="blockquote-footer">Defaults: 
      ${Object.entries(o).map(e => { return `[${e[0]}: ${e[1]}]` })}
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
      $(`#${test["routeSlug"]}`).attr("value", test["routeSlug"] + "?updates=true" + Object.entries(addParams).map(e => { return `&${e[0]}=${e[1]}` }));
    }
  }
});

// Handle submit button
function getCheckedBoxes(e) {
  e.preventDefault();
  let label = document.getElementById('test-label');
  let checkboxes = document.getElementsByName('test');
  let checkedBoxes = {};
  let uncheckedBoxes = {};

  // Add checked boxes to array to send to main process
  checkboxes.forEach(box => {
    if (box.checked) {
      checkedBoxes[box.nextElementSibling.innerText] = box.value;
    }
    else {
      uncheckedBoxes[box.nextElementSibling.innerText] = box.value;
    }
  });

  let data = {
    'label': label.value,
    'boxes': Object.keys(checkedBoxes).length == 0 ? uncheckedBoxes : checkedBoxes
  };
  console.log(data);
  ipcRenderer.send('add-test', data);
}

// Uncheck all other boxes if all tests is checked
function allChecked() {
  let allCheckbox = document.getElementById('all');
  if (allCheckbox.checked) {
    allTests = document.getElementsByName('test');
    allTests.forEach(test => {
      test.checked = false;
    });
  }
}