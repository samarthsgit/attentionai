console.log("todo-list.js script is laoded")
document.addEventListener('DOMContentLoaded', event => {
    const todoFormElement = document.getElementById('todo-form');
    const goalInputElement = document.getElementById('goal-input');
    const taskListElement = document.getElementById('task-list');
    const scheduledTimeElement = document.getElementById('scheduled-time');
    const currentDateElement = document.getElementById('currentDate');
    const durationElement = document.getElementById('duration');

    const currentDateString = new Date().toString();
    currentDateElement.setAttribute('value', currentDateString);

    todoFormElement.addEventListener('submit', event => {
        event.preventDefault(); // Prevent the form from submitting the traditional way
        const task = goalInputElement.value;
        const scheduledTime = scheduledTimeElement.value;
        const currentDate = currentDateElement.value;
        const duration = durationElement.value;

        //Adding user message to messageContainer
        createNewTaskDiv(taskListElement, task, scheduledTime, duration);

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
        .catch(error => {
            console.error('Error:', error);
        });
    });
});

function createNewTaskDiv(taskListElement, task, scheduledTime, duration) {
    const newTaskDiv = document.createElement('div');
    newTaskDiv.classList.add('task');

    //Adding checkbox element in newTaskDiv
    const newInput = document.createElement('input');
    newInput.setAttribute('type', 'checkbox');
    newTaskDiv.appendChild(newInput);

    //Adding p element in newTaskDiv
    const newP = document.createElement('p');
    newP.textContent = `${task} at ${scheduledTime} for ${duration}`;
    newTaskDiv.appendChild(newP);

    //Add newTaskDiv to taskList
    taskListElement.appendChild(newTaskDiv);
    //Make sure the sceen moves as new tasks gets add
    taskListElement.scrollTop = taskListElement.scrollHeight;
}