var tasks = {};
// This function createTask which has 3 parameters taskText , TaskData and TaskList
var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  // create list element that will hold all added new items to the task
  var taskLi = $("<li>").addClass("list-group-item");
  // create a span that is going to hold the selected date
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  // create a p element which will have the task typed by the users
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);
  // check due date
  auditTask(taskLi);
  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: [],
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// function to check if the due date is 2 days of current date
var auditTask = function (taskEl) {
  // to ensure element is getting to the function
  // console.log(taskEl);
  var date = $(taskEl).find("span").text().trim();
  //  ensure it worked
  // console.log(date);
  // convert to moment object at 5:00 pm
  // parsing the date into moment object using moment.js
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date

  //console.log(time);
  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};
// using jquery UI to sort the list items inside the ul.
// we are going to select the ul by its class
// The jQuery UI method, sortable(), turned every element with
//  the class list-group into a sortable list.
//The connectWith property then linked these sortable lists with any other
// lists that have the same class.
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event, ui) {
    $(this).addClass("dropover");
    // console.log("activate", this);
  },
  deactivate: function (event, ui) {
    // console.log("deactivate", this);
    $(this).removeClass("dropover");
  },
  over: function (event) {
    // console.log("over", event.target);
    $(event.target).addClass("dropover-active");
  },
  out: function (event) {
    // console.log("out", event.target);
    $(event.target).removeClass("dropover-active");
  },
  update: function (event) {
    // array to store the task data after we drag the list item and drop it to the new colomn.
    var tempArr = [];

    // here this is ul and children are li ,
    //loop over current set of children in sortable list.
    $(this)
      .children()
      .each(function () {
        var text = $(this).find("p").text().trim();
        var date = $(this).find("span").text().trim();
        //add task data to the temp array as an object
        tempArr.push({ text: text, date: date });
        console.log(tempArr);
      });
    //trim down list's ID to match object property
    var arrName = $(this).attr("id").replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function (event) {
    $(this).removeClass("dropover");
  },
});

// convert trash into a droppable
// To add this droppable functionality to the app we had to add jQuery UI file from cdn
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  // here ui is an jquery object which has property called draggable.
  // draggable is a jQuery object representing the draggable element
  drop: function (event, ui) {
    // console.log("drop");
    ui.draggable.remove();
    //no need to call the saveTask(). removing task from the list triggers a sortable update(),
    // meaning sortable task calls SaveTask() for us.
  },
  over: function (event, ui) {
    console.log("over");
  },
  out: function (event, ui) {
    console.log("out");
  },
});

// adding jQuery to datepicker
$("#modalDueDate").datepicker({
  // passing an object inside datepicker to so that the user can not pick the back date
  minDate: 1,
  onClose: function () {
    //when calender is closed , force a "change" event on the `dateInput`
    $(this).trigger("change");
  },
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate,
    });

    saveTasks();
  }
});

// add event listener to p element so that when user click on a p , p will turn into text area.
// we are adding an event  listener to the parent which is <ul> in this case .
// we cant add an event listener to the dynamically created p element so order to make p clickable we will
// the event will move upward from <p> element which is inside the <li> through event propagation.

$(".list-group").on("click", "p", function () {
  // console.log("<p> was clicked");
  // here "this" refers to the selected element which is p here.
  // console.log(this);
  var text = $(this).text().trim();
  // create a textarea element.
  var textInput = $("<textarea>").addClass("form-control").val(text);
  // replacing the p element with textarea using replaceWith method
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// add blur to the textarea that will tell us if the user get out of the text area.
$(".list-group").on("blur", "textarea", function () {
  // get the textarea's current value/text
  var text = $(this).val.trim();
  //get the parent ul's id attribute , task status returns an array like (eg. toDo)
  //  here this is p element and closet()is <ul>, attr is <li>
  var status = $(this).closet(".list-group").attr("id").replace("list-", "");
  // get the task's position in the list of the other li elements
  // tasks status index will tell us the index of the list item in an array.closest() brings the list and index() brings the index
  var index = $(this).closest(".list-group-item").index();
  // if we knew the value of the text we would update tasks array like this
  // tasks.toDo[0].text = "walk the dog";
  //here the tasks object is getting updated with the new value
  tasks[status][index].text = text;
  saveTasks();
  //recreate p element
  var taskP = $("<p>").addClass("m-1").text(text);
  // replace textarea with p element
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function () {
  //get current text /date
  var date = $(this).text().trim();

  //create new input element
  //.attr() attribute with one argument gets the element using id or something ,.attr() with 2 arguments
  //setup the attribute type and value
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  // swap out element with latest value
  $(this).replaceWith(dateInput);
  //enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function () {
      // when calender is closed , force a "change" event
      $(this).trigger("change");
    },
  });
  dateInput.trigger("focus");
});

// on blur when user click outside the span
$(".list-group").on("change", "input[type='text']", function () {
  // get the changed/edited date
  var date = $(this).val().trim();
  // get the parent ul's id attribute //status will tell us like toDo, inProgress,inReview,done
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  // get the index of the list item in <ul>
  var index = $(this).closest(".list-group-item").index();
  //update the task in array and re-save to  local storage
  tasks[status][index].date = date;
  // save task in  local storage also
  saveTasks();
  // recreate span
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  //replace Input with span element
  $(this).replaceWith(taskSpan);
  // pass task's <li> element into audiTask() to check new due date

  auditTask($(taskSpan).closest(".list-group-item"));
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();
