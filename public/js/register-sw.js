//Register Service Worker, Initializing Web Push
//Can access client side

function checkPermission() {
    if(!('serviceWorker' in navigator)) {
        throw new Error("No support for service worker!");
    }

    if(!('Notification' in window)) {
        throw new Error("No support for notification");
    }
}

async function requestNotificationPermission() {
    const permission = await Notification.requestPermission();

    if(permission !== 'granted') {
        throw new Error("Permission not granted");
    }
}

async function registerSW() {
    const registration = await navigator.serviceWorker.register('js/sw.js');
    if (registration.active) {
        registration.active.postMessage({ userId: userId });
    } else {
        registration.onupdatefound = function() {
            registration.installing.onstatechange = function() {
                if (this.state === 'activated') {
                    this.postMessage({ userId: userId });
                }
            };
        };
    }
    return registration;
}

async function main() {
    try {
        checkPermission();
        await requestNotificationPermission();
        await registerSW();
    } catch (error) {
        console.error("Error in service worker setup:", error);
    }
}


//Check if already registered and hide the button
// document.addEventListener('DOMContentLoaded', e => {
//     if (Notification.permission == 'granted') {
//         const notificationBtn = document.getElementById('notification-btn');
//         notificationBtn.style.display = 'none';
//     }
// }); 
