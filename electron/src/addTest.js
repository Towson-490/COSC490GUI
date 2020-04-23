var { ipcRenderer } = require('electron');

var addData = {} 
// Get data from main window
ipcRenderer.on('add-data', function(e, data){
  addData = data;
  console.log(data)
  
});

// Handle submit button
function getCheckedBoxes(e){
  e.preventDefault();
  var label = document.getElementById('test-label');
  var checkboxes = document.getElementsByName('test');
  var checkedBoxes = {}
  var uncheckedBoxes = {}

  // Add checked boxes to array to send to main process
  checkboxes.forEach(box => {
    if (box.checked){  
      checkedBoxes[box.nextElementSibling.innerText] = box.value
    }
    else{
      uncheckedBoxes[box.nextElementSibling.innerText] = box.value
    }
  });

  var data = {'label': label.value, 
              'boxes': Object.keys(checkedBoxes).length==0 ? uncheckedBoxes : checkedBoxes
            };
  console.log(data)
  ipcRenderer.send('add-test', data);
}

// Uncheck all other boxes if all tests is checked
function allChecked(){
  allCheckbox = document.getElementById('all');
  savedTests = []
  if(allCheckbox.checked){
    allTests = document.getElementsByName('test');
    allTests.forEach(test => {
      test.checked = false;
    });
  }  
}