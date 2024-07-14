const brandDiv = document.getElementById("brand-div");
// const userIcon = document.getElementById("user-icon");

//Redirect to home on clicking logo
brandDiv.addEventListener('click', () => {
    //TODO: Change this URL to Domain Name
    window.location.href = "http://localhost:3000/app";
});

brandDiv.style.cursor = 'pointer';