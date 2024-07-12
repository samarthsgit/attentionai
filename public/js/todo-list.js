console.log("todo-list.js script is laoded")
document.addEventListener('DOMContentLoaded', event => {
    const todoFormElement = document.getElementById('todo-form');
    const goalInputElement = document.getElementById('goal-input');
    const taskListElement = document.getElementById('task-list');
    const scheduledTimeElement = document.getElementById('scheduled-time');
    const currentDateElement = document.getElementById('currentDate');
    const durationElement = document.getElementById('duration');
    const listContainer = document.getElementById('list-container');

    const currentDateString = new Date().toString();
    currentDateElement.setAttribute('value', currentDateString);

    todoFormElement.addEventListener('submit', event => {
        event.preventDefault(); // Prevent the form from submitting the traditional way
        const task = goalInputElement.value;
        const scheduledTime = scheduledTimeElement.value;
        const currentDate = currentDateElement.value;
        const duration = durationElement.value;
        let taskId = null;

        

        // Clear the input field
        goalInputElement.value = '';
        scheduledTimeElement.value = null;
        durationElement.value = null;

        // Send the message to the server using axios. Make sure to add axios cdn
        axios.post('/addTask', {
            taskName: task,
            scheduledTime: scheduledTime,
            currentDate: currentDate,
            duration: duration
        })
        .then(response => {
            // Update the messages container with the new message
            taskId = response.data.response;
            console.log(`New task id is ${taskId}`);
            createNewTaskDiv(taskId, taskListElement, listContainer, task, scheduledTime, duration);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        console.log(`task id is ${taskId}`);
        //Adding user message to messageContainer
        // createNewTaskDiv(taskId, taskListElement, listContainer, task, scheduledTime, duration);
    });
});

// function createNewTaskDiv(taskId, taskListElement, task, scheduledTime, duration) {
//     const newTaskDiv = document.createElement('div');
//     newTaskDiv.classList.add('task');
//     newTaskDiv.id = `task-${taskId}`;

//     const newTaskContentDiv = document.createElement('div');
//     newTaskContentDiv.classList.add('task-content');

//     //Adding checkbox element in newTaskContentDiv
//     const newInput = document.createElement('input');
//     newInput.setAttribute('type', 'checkbox');
//     newTaskContentDiv.appendChild(newInput);

//     //Adding p element in newTaskDiv
//     const newP = document.createElement('p');
//     newP.textContent = `${task} at ${scheduledTime} for ${duration}`;
//     newTaskDiv.appendChild(newP);

//     //Add newTaskDiv to taskList
//     taskListElement.appendChild(newTaskDiv);
//     //Make sure the sceen moves as new tasks gets add
//     taskListElement.scrollTop = taskListElement.scrollHeight;
// }

//Deleting Tasks
function deleteTask(id) {
    const task = document.getElementById(`task-${id}`);
    console.log(task);
    task.remove();

    axios.post('/delete-task', {
        taskId: id
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//Create new div
function createNewTaskDiv(taskId, taskListElement, listContainer, taskName, scheduledTime, duration) {
    // Create the main task div
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.id = `task-${taskId}`;

    // Create the task content div
    const taskContentDiv = document.createElement('div');
    taskContentDiv.className = 'task-content';

    // Create checkbox input
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = '';

    // Create label
    const label = document.createElement('label');
    label.htmlFor = `task-${taskId}`;

    // Create task name span
    const taskNameSpan = document.createElement('span');
    taskNameSpan.className = 'task-name';
    taskNameSpan.textContent = taskName;

    // Create task details span
    const taskDetailsSpan = document.createElement('span');
    taskDetailsSpan.className = 'task-details';

    // Create task time span
    const taskTimeSpan = document.createElement('span');
    taskTimeSpan.className = 'task-time';
    taskTimeSpan.textContent = scheduledTime;

    // Create task duration span
    const taskDurationSpan = document.createElement('span');
    taskDurationSpan.className = 'task-duration';
    taskDurationSpan.textContent = `${duration} min`;

    // Append time and duration to task details
    taskDetailsSpan.appendChild(taskTimeSpan);
    taskDetailsSpan.appendChild(taskDurationSpan);

    // Append task name and details to label
    label.appendChild(taskNameSpan);
    label.appendChild(taskDetailsSpan);

    // Append checkbox and label to task content div
    taskContentDiv.appendChild(checkbox);
    taskContentDiv.appendChild(label);

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-task';
    deleteButton.id = `delete-task-${taskId}`;
    deleteButton.setAttribute('aria-label', 'Delete task');
    deleteButton.textContent = '×';
    deleteButton.onclick = function() { deleteTask(taskId); };

    // Append task content and delete button to main task div
    taskDiv.appendChild(taskContentDiv);
    taskDiv.appendChild(deleteButton);

    // Append the new task div to the task list element
    listContainer.appendChild(taskDiv);
    listContainer.scrollTop = listContainer.scrollHeight;
}