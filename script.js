// Global state.
var listCache;

//
// Click handlers.
//

function doUp(event){

  event.preventDefault();

  // Extract the row index and convert to an int.
  var index = parseInt(event.target.dataset.index);

  // Swap with the list entry above.
  var tmp = listCache[index];
  listCache[index] = listCache[index - 1];
  listCache[index - 1] = tmp;

  // Re-draw the table.
  buildTable(listCache);
}

function doDown(event){

  event.preventDefault();

  // Extract the row index and convert to an int.
  var index = parseInt(event.target.dataset.index);

  // Swap with the list entry below.
  var tmp = listCache[index];
  listCache[index] = listCache[index + 1];
  listCache[index + 1] = tmp;

  // Re-draw the table.
  buildTable(listCache);
}

var editingIndex;

function doEdit(event){

  event.preventDefault();

  // Extract the row index and convert to an int.
  editingIndex = parseInt(event.target.dataset.index);

  // Fill out the edit form.
  $("#edit_val1").val(listCache[editingIndex]["val1"]);
  $("#edit_val2").val(listCache[editingIndex]["val2"]);
  $("#edit_val3").val(listCache[editingIndex]["val3"]);

  $("#edit_dialog").dialog("open");
}

// Called when 'Ok' is clicked in edit dialog.
function editDone(){

  $("#edit_dialog").dialog("close");

  // Update the list cache with new values.
  listCache[editingIndex]["val1"] = $("#edit_val1").val();
  listCache[editingIndex]["val2"] = $("#edit_val2").val();
  listCache[editingIndex]["val3"] = $("#edit_val3").val();

  // Re-draw the table.
  buildTable(listCache);
}

function doSave(){
  saveData();
}

//
// Table handling
//

function buildTable(list){

  $("#the_table tbody").html("");

  $.each(list, function(index, value){

    // Start the row.
    var tr = "<tr>";

    // Row data.
    tr += "<td id='val1_" + index + "'>" + value["val1"] + "</td>";
    tr += "<td id='val2_" + index + "'>" + value["val2"] + "</td>";
    tr += "<td id='val3_" + index + "'>" + value["val3"] + "</td>";

    // Edit button.
    tr += "<td><a href='#' data-index='"+index+"' class='edit'>Edit</a></td>";

    // Up link, except for first row.
    if(index == 0)
      tr += "<td/>"
    else
      tr += "<td><a href='#' data-index='"+index+"' class='up'>Up</a></td>";

    // Down link, except for last row.
    if(index == list.length - 1)
      tr += "<td/>"
    else
      tr += "<td><a href='#' data-index='"+index+"' class='down'>Down</a></td>";

    // Close the row.
    tr += "</tr>"

    $("#the_table tbody").append(tr);

  });

  // Set up click handlers on new table rows.
  $(".edit").click(doEdit);
  $(".up").click(doUp);
  $(".down").click(doDown);
}

//
// JSON data handling.
//

function saveData(){
  var toSave = {};

  // Iterate over the form's input elements,
  // converting to an id => value map.
  $('#the_form *').filter(':input').each(function(){
    // 'this' is the input element that 'each'
    // has pulled out for this iteration.
    toSave[this.id] = this.value;
  });

  // Add the current list state.
  $.each(listCache, function(index,listEntry){
    // Iterate over each of the list entry's members,
    // adding it to the map to be saved.
    $.each(listEntry, function(key, value) {
      toSave["list_" + index + "_" + key] = value;
    });
  });

  // Could do a POST at this point.
  console.log(JSON.stringify(toSave));
}

function loadData(data){

  // Initialise the list cache.
  listCache = [];

  // Create the RegExp used to parse list entries.
  // Format is 'list_[INDEX]_[SUBKEY]'
  var listRegExp = /list_(\d+)_(.+)/;

  // Fill in the form.
  $.each(data, function(key, value){

    if(key.indexOf("list") != 0){
      // Ordinary data item, copy into the form.
      $("#" + key).val(value);
    } else {
      // Special handling for list entries.

      // Parse the key
      var regRes = listRegExp.exec(key);

      if(regRes != null){
        // Regular expression matched.

        var listIndex = parseInt(regRes[1]);

        // Create the list entry if it doesn't already exist.
        if(!listCache[listIndex]) listCache[listIndex]={};

        // Fill in the sub-key with the value.
        listCache[listIndex][regRes[2]]=value;
      } else {
        console.log("Bad key: " + key);
      }

    }

  })

  buildTable(listCache);
}

//
// Document ready 'entry point'.
//

$(document).ready(function(){

  // Set up the edit dialog.
  $("#edit_dialog").dialog({
    autoOpen : false,
    modal: true,
    buttons: {
        "Ok": editDone,
        Cancel: function() {
          $("#edit_dialog").dialog( "close" );
        }
      }
  });


  // Download the data and feed it to 'loadData'.
  $.getJSON("data.json", loadData);
});
