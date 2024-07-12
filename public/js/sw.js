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

self.addEventListener('push', e => {
    self.registration.showNotification("Woooh!", {body: e.data.text()});
});

self.addEventListener('message', function(event) {
    const data = event.data;
    if (data.userId) {
        self.userId = data.userId;
        console.log('Service Worker received userId:', self.userId);
    }
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