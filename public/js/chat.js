console.log("chat.js script is laoded")
document.addEventListener('DOMContentLoaded', event => {
    const chatForm = document.getElementById('chat-form');
    const userMessage = document.getElementById('user-input');
    const messagesContainer = document.getElementById('chat-messages');

    chatForm.addEventListener('submit', event => {
        event.preventDefault(); // Prevent the form from submitting the traditional way
        const message = userMessage.value;

        //Adding user message to messageContainer
        createNewMessageDiv(messagesContainer, message, 'user');

        // Clear the input field
        userMessage.value = '';

        // Send the message to the server using axios. Make sure to add axios cdn
        axios.post('/send', {
            userInput: message
        })
        .then(response => {
        // Update the messages container with the new message
        const message = response.data.response;
        createNewMessageDiv(messagesContainer, message, 'ai');
        })
        .catch(error => {
        console.error('Error:', error);
        });
    });
});

function createNewMessageDiv(messagesContainer, message, sentBy) {
    const newMessageDiv = document.createElement('div');
    newMessageDiv.classList.add('message', `${sentBy}-message`);
    newMessageDiv.textContent = message;
    messagesContainer.appendChild(newMessageDiv);
    //Make sure the chat sceen moves as new chat gets add
    messagesContainer.scrollTop = chatMessages.scrollHeight;
}

//Set session
async function setSession() {
    const response = await axios.get('http://localhost:3000/set-session'); //TODO - change on deploy
    console.log(response.data);
}
setSession();
