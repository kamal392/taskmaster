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

// add event listener to p element so that when user click on a p , p will turn into text area.
// we are adding an event  listener to the parent which is <ul> in this case .
// we cant add an event listener to the dynamically created p element so order to make p clickable we will
// the event will move upward from <p> element which is inside the <li> through event propagation.

$(".list-group").on("click", "p", function () {
  // console.log("<p> was clicked");
  // here "this" refers to the selected element which
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
  //recreate p element
  var taskP = $("<p>").addClass("m-1").text(text);
  // replace textarea with p element
  $(this).replaceWith(taskP);

  saveTasks();
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
  dateInput.trigger("focus");
});

// on blur when user click outside the span
$("list-group").on("blur", "input[type='text']", function () {
  // get the changed/edited date
  var date = $(this).val().trim();
  // get the parent ul's id attribute //status will tell us like toDo, inProgress,inReview,done
  var status = $(this).closest("list-group").attr("id").replace("list-", "");
  // get the index of the list item in <ul>
  var index = $(this).closest(".list-group-item").index();
  //update the task in array and re-save to  local storage
  tasks[status][index].date = date;
  // save task in  local storage also
  saveTasks();
  // recreate span
  var taskSpan = $("<spa>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  //replace Input with span element
  $(this).replaceWith(taskSpan);
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
