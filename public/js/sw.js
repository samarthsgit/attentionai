//Service Worker
const PUBLIC_KEY = "BIJEDakxypVjag-5ISZWYHC4q9NsiJzDU-9VyNjQ2OChIcfQlvSFkE-BmOYpwczJT8VccPntDPJF5TR_nFRTsZ4";

self.addEventListener('activate', async (e) => {
    const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(PUBLIC_KEY)
    });
    const response = await saveSubscription(subscription);
    console.log(response);
});

// self.addEventListener('push', e => {
//     self.registration.showNotification("Woooh!", {body: e.data.text()});
// });

self.addEventListener('push', e => {
    const data = e.data.json();
    const options = {
        body: data.body,
        icon: data.icon,
        data: {
            url: data.url
        }
    };

    self.registration.showNotification(data.title, options);
});

self.addEventListener('message', function(event) {
    const data = event.data;
    if (data.userId) {
        self.userId = data.userId;
        console.log('Service Worker received userId:', self.userId);
    }
});

//On clicking notification
self.addEventListener('notificationclick', e => {
    const notification = e.notification;
    const url = notification.data.url;

    e.notification.close(); // Close the notification

    e.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (let client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});


async function saveSubscription(subscription) {
    const response = await fetch("/save-subscription", {
        method: 'post',
        headers: {'content-type': 'application/json'},
        // body: JSON.stringify(subscription)
        body: JSON.stringify({
            subscription: subscription,
            userId: self.userId
        })
    });
    return response;
}



//applicationServerKey needs to be encoded before passing to pushManager
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }